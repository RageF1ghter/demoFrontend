import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const ImagePage = () => {
    const prompts = ["landscape", "forest", "mountain", "ocean", "city", "desert", "sunset", "sunrise", "night", "day"];
    const defaultPrompt = ["4k", "high-resolution", "beautiful", "scenic", "panoramic", "aesthetic", "artistic", "HD", "wallpaper"];
    const [selectedPrompt, setSelectedPrompt] = useState([]);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handlePromptSelection = (prompt) => {
        setSelectedPrompt((prev) => {
            if (prev.includes(prompt)) {
                return prev.filter((p) => p !== prompt);
            } else {
                return [...prev, prompt];
            }
        });
    };

    const generateImage = async () => {
        const allPrompts = [...selectedPrompt, ...defaultPrompt];
        try {
            setLoading(true);
            setProgress(0);
            const response = await fetch('https://team2-backend.azurewebsites.net/generate/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userid: 'user1',
                    courseID: 'course1',
                    prompt: allPrompts.join(', '),
                    seed: 1,
                    steps: 40,
                    cfg_scale: 7.5,
                    width: 512,
                    height: 512
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }
            const data = await response.json();
            setGeneratedImage(data.imageUrl);
        } catch (error) {
            setError('Error generating image');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(async () => {
                try {
                    const progressResponse = await fetch('https://team2-backend.azurewebsites.net/generate/progress');
                    const progressData = await progressResponse.json();
                    console.log('Progress:', progressData.progress);
                    setProgress(progressData.progress * 100);
                    if (progressData.progress === 1) {
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Error fetching progress:', error);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [loading]);

    return (
        <div>
            <h1>Generate your exclusive image</h1>
            <p>Select your image features:</p>
            <ul>
                {prompts.map((prompt) => (
                    <li key={prompt}>
                        <button onClick={() => handlePromptSelection(prompt)} >
                            {prompt}
                        </button>
                    </li>
                ))}
                <p>Selected Prompts: {selectedPrompt.join(', ')}</p>
            </ul>
            <button onClick={generateImage} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Image'}
            </button>
            {loading && <div><p>Progress: {progress.toFixed(2)}%</p><progress value={progress} max="100" /></div>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {generatedImage && (
                <div>
                    <h2>Generated Image</h2>
                    <img src={generatedImage} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
            )}
            <br />
            <button onClick={() => navigate('/course')}>Next</button>
        </div>
    );
};

export default ImagePage;
