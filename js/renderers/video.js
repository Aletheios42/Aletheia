//render/video.js

renderVideo(url) {
    // Detectar tipo de video
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = this.extractYouTubeId(url);
        return `
            <div class="video-container">
            <iframe 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allowfullscreen>
            </iframe>
            </div>
            `;
    } else {
        // Video local
        return `
            <div class="video-container">
            <video controls>
            <source src="${url}" type="video/mp4">
            Tu navegador no soporta el elemento video.
            </video>
            </div>
            `;
    }
}

extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

