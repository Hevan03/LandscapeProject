import LandscaperRequest from "../Models/landscaperRequestModel.js";

export const createRequest = async (req, res) => {
  try {
    const { projectId, landscaper, items, total } = req.body;

    if (!projectId || !landscaper || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRequest = new LandscaperRequest({
      projectId,
      landscaper,
      items,
      total,
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await LandscaperRequest.find()
      .populate("items.item", "itemname price quantity") // populate item details
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Server error" });
  }
};
