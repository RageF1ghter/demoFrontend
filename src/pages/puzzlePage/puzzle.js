import React, { useState, useEffect, useRef } from 'react';
import './puzzle.css';

function PuzzlePage() {
    const col = 3;
    const row = 2;
    const canvasRef = useRef(null);
    const [pieces, setPieces] = useState([]);
    const [draggedPiece, setDraggedPiece] = useState(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isCompleted, setIsCompleted] = useState(false); // Track puzzle completion
    const imageRef = useRef(null);
    const [imageURL, setImageURL] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');

    useEffect(() => {
        fetchImageURL();
    }, []);

    const fetchImageURL = async () => {
        try {
            const response = await fetch('http://localhost:3000/puzzle/getImageUrl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userid: 'user1',
                    courseID: 'course1'
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch image from backend');
            }
            const data = await response.json();
            setImageURL(data.url);
        } catch (error) {
            console.error('Failed to fetch image from backend:', error);
        }
    };

    useEffect(() => {
        if (imageURL) {
            loadImage(imageURL);
        }
    }, [imageURL]);

    const loadImage = async (url) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas reference is null');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }

        try {
            // Fetch the image as a blob
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Create an image bitmap from the blob
            const imageBitmap = await createImageBitmap(blob);

            // Set the canvas dimensions
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height * 2;

            // Draw the grid and initialize pieces
            drawGrid(ctx, imageBitmap.width, imageBitmap.height * 2, row * 2, col);
            imageRef.current = imageBitmap; // Store the loaded image
            initializePieces(imageBitmap, imageBitmap.width / col, imageBitmap.height / row, imageBitmap.height);

            // Update the download URL
            const newDownloadUrl = URL.createObjectURL(blob);
            setDownloadUrl(newDownloadUrl);

        } catch (error) {
            console.error('Error loading image:', error);
        }
    };

    const initializePieces = (img, pieceWidth, pieceHeight, offsetY) => {
        const tempPieces = [];

        // Create pieces in their original positions
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                tempPieces.push({
                    id: `${i}-${j}`,
                    x: j * pieceWidth,
                    y: offsetY + i * pieceHeight, // pieces are drawn below the full image
                    width: pieceWidth,
                    height: pieceHeight,
                    correctX: j * pieceWidth,
                    correctY: i * pieceHeight
                });
            }
        }

        // Shuffle the positions of the pieces but keep them within the bottom 3x2 grid
        const shuffledPieces = tempPieces.sort(() => Math.random() - 0.5);
        shuffledPieces.forEach((piece, index) => {
            piece.x = (index % col) * pieceWidth;
            piece.y = offsetY + Math.floor(index / col) * pieceHeight;
        });

        setPieces(shuffledPieces);
        drawPieces(shuffledPieces, img, pieceWidth, pieceHeight);
    };

    const drawGrid = (ctx, width, height, rows, cols) => {
        const cellWidth = width / cols;
        const cellHeight = height / rows;

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;

        // Draw vertical lines
        for (let i = 1; i < cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let j = 1; j < rows; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * cellHeight);
            ctx.lineTo(width, j * cellHeight);
            ctx.stroke();
        }
    };


    const drawPieces = (pieces, img, pieceWidth, pieceHeight) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw each piece
        pieces.forEach(piece => {
            ctx.drawImage(
                img,
                piece.correctX, piece.correctY, // source x and y
                pieceWidth, pieceHeight, // source width and height
                piece.x, piece.y, // destination x and y
                pieceWidth, pieceHeight // destination width and height
            );
        });

        // Draw the grid on top of everything if the puzzle is not completed
        if (!isCompleted) {
            drawGrid(ctx, canvas.width, canvas.height, row * 2, col);
        }
    };

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        for (let piece of pieces) {
            if (mouseX >= piece.x && mouseX <= piece.x + piece.width &&
                mouseY >= piece.y && mouseY <= piece.y + piece.height) {
                setDraggedPiece(piece);
                setOffset({ x: mouseX - piece.x, y: mouseY - piece.y });
                break;
            }
        }
    };

    const handleMouseMove = (e) => {
        if (!draggedPiece) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const updatedPieces = pieces.map(piece => 
            piece.id === draggedPiece.id 
            ? { ...piece, x: mouseX - offset.x, y: mouseY - offset.y }
            : piece
        );

        setPieces(updatedPieces);
        drawPieces(updatedPieces, imageRef.current, draggedPiece.width, draggedPiece.height);
    };

    const handleMouseUp = () => {
        if (!draggedPiece) return;

        const pieceWidth = draggedPiece.width;
        const pieceHeight = draggedPiece.height;

        const updatedPieces = pieces.map(piece => {
            if (piece.id === draggedPiece.id) {
                // Snap to grid
                const snapX = Math.round(piece.x / pieceWidth) * pieceWidth;
                const snapY = Math.round(piece.y / pieceHeight) * pieceHeight;

                // Ensure it doesn't snap to the bottom half
                const snappedPiece = {
                    ...piece,
                    x: snapX,
                    y: snapY >= imageRef.current.height ? piece.y : snapY // Prevent snapping to the bottom
                };

                // Check if piece is in correct position
                if (snapX === piece.correctX && snapY === piece.correctY) {
                    return snappedPiece;
                } else {
                    return { ...snappedPiece, x: piece.x, y: piece.y };
                }
            } else {
                return piece;
            }
        });

        setPieces(updatedPieces);
        drawPieces(updatedPieces, imageRef.current, draggedPiece.width, draggedPiece.height);
        setDraggedPiece(null);

        // Check if the puzzle is completed
        if (checkCompletion(updatedPieces)) {
            setIsCompleted(true);
        }
    };

    const checkCompletion = (pieces) => {
        return pieces.every(piece => piece.x === piece.correctX && piece.y === piece.correctY);
    };

    return (
        <div className="puzzle-page">
            <h1>Puzzle Page</h1>
            <canvas
                id="puzzleCanvas"
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            ></canvas>
            {isCompleted && (
                <div className="congratulations">
                    <h2>Congratulations! You completed the puzzle!</h2>
                    <a href={downloadUrl} download="original-image.png">Download Original Image</a>
                </div>
            )}
        </div>
    );
}

export default PuzzlePage;
