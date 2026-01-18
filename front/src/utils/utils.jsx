import { toast } from 'react-toastify';
import {useNavigate} from "react-router-dom";


export const sendData = async ({route = "/", data = {}, method="POST", isFileDownload = false, basePath='api'}) => {
    let options = {
        method: method,
        headers: {}
    }
    // For file downloads, don't set Accept header to application/json
    if (!isFileDownload) {
        options.headers['Accept'] = 'application/json';
    }
    
    if(method === "POST"){
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch("/"+basePath+route, options);
        
        if (response.status === 401) {
            let jwtResponse = await fetch("/api/token/refresh")
            if (!jwtResponse.ok) {
                // il faut logout
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
                return { error: true, error_message: "Votre session à expiré" };
            }
            return sendData({route:route, method:method, data:data, isFileDownload:isFileDownload});
        }

        if(response.status === 500){
            let result = await response.json()
            throw new Error(result.detail)
        }
        
        // Handle file download
        if (isFileDownload) {
            if (!response.ok) {
                const errorResult = { error: true, error_message: `Téléchargement non réussi : ${response.statusText}` };
                showErrorNotification(errorResult.error_message);
                return errorResult;
            }
            
            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'download';
            
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }
            
            // Convert to blob and trigger download
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return { success: true, message: "File downloaded successfully" };
        }
        
        // Handle regular JSON response
        const result = await response.json();
        
        // Check if the response has an error and show notification
        if (result.error === 1 && result.error_message) {
            showErrorNotification(result.error_message);
            return result;
        }
        
        return result.data ?? {};
        
    } catch (error) {
        showErrorNotification(error.message);
        return { error: true, error_message: error };;
    }
}

export const showErrorNotification = (message) => {
    toast.error(message, {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        })
    }