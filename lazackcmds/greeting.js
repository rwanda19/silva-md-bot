const userLastMessageMap = new Map();

export async function all(m) {
  const ONE_DAY = 24 * 60 * 60 * 1000; // Time interval in milliseconds (1 day)
  const currentTime = Date.now();
  const userId = m.sender;

  // Only respond in private chats and ensure m.sender is valid
  if (!userId || m.isGroup || m.isBaileys) {
    return;
  }

  // Check if the user has already sent a message today
  if (userLastMessageMap.has(userId)) {
    const lastMessageTime = userLastMessageMap.get(userId);
    if (currentTime - lastMessageTime < ONE_DAY) {
      return; // Ignore if the user has already sent a message today
    }
  }

  // Welcome message with ad tag
  const welcomeMessage = `
*🎉 Welcome! 🎉*  
Hello 💕🥰 @${userId.split('@')[0] || 'User'},  

I'm *SILVA MD BOT*, your personal assistant!  
Here’s what you can do:  
1️⃣ Ask me questions.  
2️⃣ Get information about Silva Tech Inc.  
3️⃣ Explore fun features.  

💡 Visit our WhatsApp Channel for updates and exclusive content:  

For more info about Silva Tech Inc., check out:  
https://www.atom.bio/silvatechinc  

Thank you for messaging! Let me know how I can assist you today.  
`.trim();

  // Send the welcome message
  try {
    await this.sendMessage(
      m.chat,
      {
        text: welcomeMessage,
        mentions: [userId],
        contextInfo: {
          externalAdReply: {
            title: '🌟 Join Silva Tech Inc. Channel!',
            body: 'Stay updated with the latest news and content.',
            thumbnailUrl: 'https://i.imgur.com/KHo9dhK.jpeg', // Replace with your valid image URL
            sourceUrl: 'https://whatsapp.com/channel/0029VaAkETLLY6d8qhLmZt2v',
            renderLargerThumbnail: true,
          },
        },
      }
    );

    // React to the message (if supported by your framework)
    if (typeof m.react === 'function') {
      await m.react('👋');
    }

    // Update the last message time for the user
    userLastMessageMap.set(userId, currentTime);
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }

  return true;
}
