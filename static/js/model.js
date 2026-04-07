// The Model manages the state of the PDF reader.
const PDFModel = {
    // Current state
    currentDocument: null,
    totalPageCount: 0,
    isFullyLoaded: false,

    // Initialize the PDF.js worker (required for performance)
    init: function() {
        // Points pdf.js to its web worker so it processes PDFs in the background without freezing the UI
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    },

    // Takes a raw file from the computer and converts it to a PDF object
    loadPDFFile: async function(file) {
        const fileReader = new FileReader();

        // Wrap the FileReader in a Promise so we can use modern async/await syntax
        return new Promise((resolve, reject) => {
            fileReader.onload = async function() {
                try {
                    // Turn the file into a typed array that pdf.js can read
                    const typedarray = new Uint8Array(this.result);
                    
                    // Load the document via pdf.js
                    PDFModel.currentDocument = await pdfjsLib.getDocument(typedarray).promise;
                    PDFModel.totalPageCount = PDFModel.currentDocument.numPages;
                    PDFModel.isFullyLoaded = true;
                    
                    resolve(PDFModel.currentDocument);
                } catch (error) {
                    reject("Error parsing the PDF: " + error);
                }
            };
            // Start reading the file
            fileReader.readAsArrayBuffer(file);
        });
    },

    // Fetches a specific page and renders it onto an HTML Canvas element
    renderPageToCanvas: async function(pageNumber, canvasElement) {
        if (!this.currentDocument) return;

        const page = await this.currentDocument.getPage(pageNumber);
        
        // Calculate the scale to make the PDF text crisp. 1.5 is a good baseline for high quality.
        const viewport = page.getViewport({ scale: 1.5 });
        
        // Prepare canvas using PDF page dimensions
        const context = canvasElement.getContext('2d');
        canvasElement.height = viewport.height;
        canvasElement.width = viewport.width;

        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
    }
};

// Initialize the model when the script loads
PDFModel.init();
