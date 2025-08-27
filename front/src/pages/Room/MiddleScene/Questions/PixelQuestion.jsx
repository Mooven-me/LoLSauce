import { useState, useEffect } from "react";

export default function PixelQuestion(props) {
    const [currentIndex, setCurrentIndex] = useState(4);
    
    const content = props.content || {};
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                // Cycle through 4, 8, 12, 16, then back to 4
                if (prevIndex >= 16) {
                    return prevIndex;
                }
                return prevIndex + 4;
            });
        }, 3000); 
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);
    
    // Get current image data
    const currentImageData = content[currentIndex];
    const imageSrc = currentImageData ? `data:image/jpeg;base64,${currentImageData}` : null;
    
    return (
        <>
            {imageSrc && (
                <img 
                    src={imageSrc} 
                    alt="Pixel question"
                    className="img-fluid"
                    style={{ maxWidth: '400px', height: 'auto', borderRadius:"10px" }}
                />
            )}
        </>
    );
}