import React, { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { Spinner } from "./Spinner";

export default function AuthenticatedImage({ src, alt, className = "", style = {} }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgSrc(null);
      setLoading(false);
      return;
    }

    let active = true;
    let objectUrl = null;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Fetch as blob with auth headers (handled automatically by axiosClient)
        const response = await api.get(src, { responseType: "blob" });
        
        if (active) {
          objectUrl = URL.createObjectURL(response.data);
          setImgSrc(objectUrl);
        }
      } catch (err) {
        console.error("Error loading authenticated image", err);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 ${className}`} style={style}>
        <Spinner size="sm" />
      </div>
    );
  }

  if (error || !imgSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-2 text-center text-xs ${className}`} style={style}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span>Image unavailable</span>
      </div>
    );
  }

  return <img src={imgSrc} alt={alt} className={className} style={style} />;
}
