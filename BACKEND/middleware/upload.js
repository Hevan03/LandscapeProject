import multer from "multer";
import path from "path";

// 1. Configure Storage
const storage = multer.diskStorage({
  // Destination for files
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this 'uploads' directory exists
  },

  // Filename to use
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// 2. Create a File Filter for Images
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|webp|avif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = /image\/(jpeg|jpg|png|gif|webp|avif)/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only! (jpeg, jpg, png, gif, webp, avif)"));
  }
};

// 3. Initialize Multer with the configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 5MB file size limit
  fileFilter: fileFilter,
});

export default upload;
