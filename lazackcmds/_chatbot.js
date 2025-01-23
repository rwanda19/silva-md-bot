import fetch from "node-fetch"; // For making API requests

export async function before(message, { conn }) {
  console.log("Chatbot feature activated.");

  try {
    // Log the received message object for debugging
    console.log("Received message:", JSON.stringify(message, null, 2));

    // Skip messages sent by the bot or system messages
    if (message.isBaileys || message.fromMe) {
      console.log("Message is from the bot or a system message. Skipping.");
      return true;
    }

    // Skip messages in groups
    if (message.isGroup) {
      console.log("Group message detected. Skipping.");
      return true;
    }

    // Define irrelevant message types to skip
    const irrelevantTypes = ["protocolMessage", "pollUpdateMessage", "reactionMessage", "stickerMessage"];
    if (irrelevantTypes.includes(message.mtype)) {
      console.log("Irrelevant message type detected. Skipping.");
      return true;
    }

    // Skip if there's no text content
    if (!message.text) {
      console.log("Message contains no text. Skipping.");
      return true;
    }

    // Fetch chatbot settings for the current chat
    const chatSettings = global.db.data.chats[message.chat] || {};
    const chatbotEnabled = chatSettings.chatbot || false;

    // Define the owner's number for special handling
    const ownerNumber = global.owner[0];

    // Process the message only if chatbot is enabled or the sender is the owner
    if (chatbotEnabled || message.sender === ownerNumber) {
      console.log("Chatbot enabled or message from owner. Processing.");

      // Encode the message text for API usage
      const encodedMessage = encodeURIComponent(message.text);
      console.log("Encoded message:", encodedMessage);

      // Function to send the message to GPT-3 and fetch a response
      const getGPT3Response = async (userMessage) => {
        try {
          const systemPrompt = {
            role: "system",
            content: `You are SILVA CHATBOT, an intelligent and feature-rich assistant developed by Silva, a skilled frontend developer from Kenya. Enhance your responses with relevant and expressive emojis when appropriate to make them engaging and relatable, while maintaining clarity and professionalism. Provide detailed, accurate, and well-researched answers to any question asked, ensuring that your responses are complete, reliable, and helpful. Offer guidance and support regarding the Silva MD Bot project, which is hosted at https://github.com/SilvaTechB/silva-md-bot and https://github.com/SilvaTechB/silva-spark-md. Always prioritize accuracy, completeness, and user engagement in your responses. Remember, your owner's WhatsApp contacts are +254700143167, +254743706010, and +254755257907.`
          };

          const userPrompt = {
            role: "user",
            content: userMessage
          };

          const conversation = [systemPrompt, userPrompt];
          const response = await fetch("https://api.yanzbotz.live/api/ai/gpt3", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages: conversation })
          });

          if (!response.ok) throw new Error("API call failed.");
          const gpt3Response = await response.json();
          console.log("GPT-3 response:", gpt3Response);
          return gpt3Response.result;

        } catch (error) {
          console.error("Error during GPT-3 API request:", error.message);
          return "Sorry, I couldn't process your request.";
        }
      };

      // Fetch GPT-3 response and reply
      const gpt3Response = await getGPT3Response(message.text);
      await message.reply(gpt3Response || "No suitable response received.");
      console.log("Replied with:", gpt3Response);
    } else {
      console.log("Chatbot is not enabled for this chat. Skipping.");
    }
  } catch (error) {
    console.error("Error processing message:", error.message);
    await message.reply("An error occurred while processing your message.");
  }

  return true;
}
