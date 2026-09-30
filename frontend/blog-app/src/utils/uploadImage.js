import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

/**
 * Helper untuk mengunggah gambar (thumbnail / avatar) ke backend server
 * @param {File} imageFile - File gambar dari input form
 * @returns {Promise<{ imageUrl: string }>} - URL file gambar yang berhasil diunggah
 */
export const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
        const response = await axiosInstance.post(
            API_PATHS.AUTH.UPLOAD_IMAGE,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Gagal mengunggah gambar ke server.";
        throw new Error(errorMessage, { cause: error });
    }
};

export default uploadImage;
