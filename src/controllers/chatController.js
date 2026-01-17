const chatService = require("../services/chatService");

const chatBooking = async (req, res) => {
  try {
    const info = await chatService.chatBooking(req.body);
    return res.status(200).json(info);
  } catch (e) {
    console.error("Error in chatBooking:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from the server",
      error: e.message,
    });
  }
};

module.exports = {
  chatBooking,
};
