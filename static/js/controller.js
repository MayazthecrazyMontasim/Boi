document.addEventListener('DOMContentLoaded', function() {
    // 1. Grab our UI elements from the DOM
    const importBtn = document.getElementById('open-file-btn');
    const fileInput = document.getElementById('pdf-upload');
    const flipbookContainer = document.getElementById('flipbook');
    const pageTurnAudio = document.getElementById('page-turn-sound');
    
    let pageFlipInstance = null; // This will hold our 3D book engine

    // 2. When the user clicks "Import Document", trigger the hidden file input
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 3. When a PDF is selected from their computer
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Clear the old book if there is one
        flipbookContainer.innerHTML = '';
        if (pageFlipInstance) {
            pageFlipInstance.destroy();
        }

        try {
            // Tell the Model to load our PDF
            await PDFModel.loadPDFFile(file);
            
            // Build the HTML structure for the book pages
            await buildBookStructure();

            // Initialize the 3D flip effect!
            initializeFlipbook();

        } catch (error) {
            console.error("Failed to load PDF:", error);
            alert("Could not load the PDF. Please try another file.");
        }
    });

    // 4. Creates empty HTML pages for the book, and renders the PDF onto them
    async function buildBookStructure() {
        for (let i = 1; i <= PDFModel.totalPageCount; i++) {
            // Create a physical page div
            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            
            // Create a canvas inside the page to draw the PDF text/images
            const canvas = document.createElement('canvas');
            pageDiv.appendChild(canvas);
            
            // Put the page into the book container
            flipbookContainer.appendChild(pageDiv);

            // Ask the Model to draw the PDF crisp and clean onto our canvas
            await PDFModel.renderPageToCanvas(i, canvas);
        }
    }

    // 5. The Magic: Turn those flat DOM elements into a 3D Book
    function initializeFlipbook() {
        // We use the StPageFlip library from our HTML file
        pageFlipInstance = new St.PageFlip(flipbookContainer, {
            width: 450, // Standard vintage book dimensions
            height: 600,
            size: "stretch", // Allows it to scale beautifully on screen
            minWidth: 315,
            maxWidth: 600,
            minHeight: 420,
            maxHeight: 800,
            maxShadowOpacity: 0.8, // Deep, dark academia shadows
            showCover: true, // Makes the first page act like a heavy book cover
            mobileScrollSupport: false 
        });

        // Load all the DOM pages we just created into the engine
        const pages = document.querySelectorAll('.page');
        pageFlipInstance.loadFromHTML(pages);

        // 6. Play the audio when a page is turned!
        pageFlipInstance.on('flip', (e) => {
            // We clone the audio node so it can play rapidly (if they sweep fast)
            // without cutting off the previous sound.
            const soundClone = pageTurnAudio.cloneNode();
            soundClone.volume = 0.6; // Keep it subtle and atmospheric
            soundClone.play().catch(err => console.log("Audio play blocked by browser. Click anywhere first!"));
        });
    }
});

