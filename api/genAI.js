const axios = require('axios');
const readline = require('readline');

const apiKey = 'AIzaSyC3f6ljjJh8pPxDlHJkEo6eQrTHts1iOzk';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

//TO DO: GENERATE USER FAVOURITES FROM TMDB AND TRAIN MODEL

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let userMovie = ''; 
let likedMovies = new Set(); //track movies liked
let dislikedMovies = new Set(); //track movies disliked

function getMovieRecommendation() {
    const prompt = `
    I really liked the movie "${userMovie}". Based on my preferences:
    
    - I LIKED these movies: ${[...likedMovies].join(", ") || "None yet"}.
    - I DISLIKED these movies: ${[...dislikedMovies].join(", ") || "None yet"}.

    Can you recommend a new movie that is similar to what I like and different from what I dislike?
    Provide only the movie title, its genre, and a short description.
    `;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 1.0,
            topK: 50,
            topP: 0.95,
            maxOutputTokens: 250
        }
    };

    axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } })
        .then(response => {
            const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
            
            //track feedback
            const firstLine = generatedText.split("\n")[0].trim();
            
            console.log("\nRecommended Movie:\n", generatedText);

            //feedback
            rl.question("\nDid you like this recommendation? (yes/no): ", (response) => {
                if (response.toLowerCase() === 'yes') {
                    likedMovies.add(firstLine); //store liked movie
                    console.log("Glad you liked the recommendation!");
                    rl.close();
                } else if (response.toLowerCase() === 'no') {
                    dislikedMovies.add(firstLine); //store disliked movie
                    console.log("\nFinding another recommendation...\n");
                    getMovieRecommendation();
                } else {
                    console.log("Invalid response. Please answer with 'yes' or 'no'.");
                    rl.close();
                }
            });
        })
        .catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
            rl.close();
        });
}


//debug
rl.question("Enter a movie you like: ", (movie) => {
    userMovie = movie;
    getMovieRecommendation(); 
});