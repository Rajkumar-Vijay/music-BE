import multer from "multer";
import path from "path";

// Create a more robust storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // Store files in a temporary directory
    callback(null, path.join(process.cwd(), 'temp'));
  },
  filename: function (req, file, callback) {
    // Generate a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Create the upload middleware with error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, callback) => {
    // Log file information for debugging
    console.log("Received file:", file);

    // Accept all files for now
    callback(null, true);
  }
});

// Export the middleware
export default upload;
