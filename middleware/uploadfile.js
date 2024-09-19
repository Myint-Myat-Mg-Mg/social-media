import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname,join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadFiles = async (files) => {
    try {
        const uploadDir = join(__dirname, "../uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log("Upload directory created at:", uploadDir);
        }

        const uploadedPaths = [];
        
        const filesArray = Array.isArray(files) ? files : [files];

        for (const file of filesArray) {
            const fileExtension = path.extname(file.name).toLowerCase();
            const fileName = `${Date.now()}${fileExtension}`;
            const filePath = join(uploadDir, fileName);

            await file.mv(filePath);
            console.log("File uploaded to:", filePath);

            uploadedPaths.push(`/uploads/${fileName}`);
        }

        return uploadedPaths[0];
    } catch (error) {
        console.error("Error during file upload:", error);
        throw error;
    }
}; 
//     const fileToUpload = req.files.image;
//     const uploadsPath = join(__dirname, "../uploads", fileToUpload.name);
//     fileToUpload.mv(uploadsPath, (error) => {
//         if (error) {
//             return res.status(500).send(error);
//         }

//         posts.push({
//             post: req.body.post,
//             image: `${req.protocol}://#{req.headers.host}/file/${fileToUpload.name}`,

//         });
//         res.send("File uploaded and post added!");
// });

    // const uploadDir = join(__dirname, "../uploads");

    // if (!fs.existsSync(uploadDir)) {
    //     fs.mkdirSync(uploadDir);
    // }
    // const fileName = Date.now()
    // const filePath = join(uploadDir, `${fileName}.${file.name.split('.')[1]}`);
    // await file.mv(filePath);
    // return `/uploads/${fileName}.${file.name.split('.')[1]}`;


export const getFile = (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    fs.access(filePath, fs.constants.F_OK, (error) => {
        if (error) {
            return res.status(404).send("File not found");
        }
        res.sendFile(filePath);  
    })
};

export default uploadFiles;
