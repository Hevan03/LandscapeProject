import Item from "../../Models/inventory/itemModel.js";

export async function getAllitems(req, res) {
  // Logic to retrieve all items
  try {
    const items = await Item.find().sort({ createdAt: -1 }); // -1 will sort in desc order (newest first)
    res.status(200).json(items);
  } catch (err) {
    console.error("Error in getAllitems controller:", err);
    res.status(400).json({ message: err.message }); // send actual error
  }
}

//get by Id
export async function getitemById(req, res, next) {
  const id = req.params.id;

  let item;

  try {
    item = await Item.findById(id);
  } catch (err) {
    console.log(err);
  }

  //not available items
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  return res.status(200).json({ item });
}

export async function createitem(req, res) {
  try {
    const { itemname, category, price, quantity, description } = req.body;
    const imageUrl = req.file ? req.file.path : ""; // only one image

    const item = new Item({
      itemname,
      category,
      price,
      quantity,
      description,
      imageUrl,
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    // ✅ FIXED
    console.error("Error in createitem controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateitem(req, res) {
  try {
    const {
      itemname,
      category,
      subcategory,
      price,
      quantity,
      description,
      imageUrl,
    } = req.body;

    let updateData = {
      itemname,
      category,
      subcategory,
      price,
      quantity,
      description,
    };

    if (req.file) {
      updateData.imageUrl = req.file.path; // overwrite with new image
    } else if (imageUrl) {
      updateData.imageUrl = imageUrl; // keep old one if provided
    }

    const item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Unable to update item details" });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteitem(req, res) {
  const id = req.params.id;

  let item;

  try {
    item = await Item.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }

  if (!item) {
    return res.status(404).json({ message: "Unable to delete item details" });
  }
  return res.status(200).json({ item });
}
