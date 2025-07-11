console.log("Let's start writing Javascript");

let audio = new Audio();

let isPlaying = false;
let currentSongIndex = 0;
let songs = [];

async function getSongs() {
    try {
        const response = await fetch("http://127.0.0.1:5500/songs/");
        const html = await response.text();

        const div = document.createElement("div");
        div.innerHTML = html;

        const links = div.getElementsByTagName("a");
        let songList = [];

        for (let i = 0; i < links.length; i++) {
            const title = links[i].getAttribute("title");
            if (title && title.endsWith(".mp3")) {
                songList.push(`${window.location.origin}/songs/${title}`);

            }
        }

        return songList;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

async function main() {
    songs = await getSongs();



    if (songs.length > 0) {
        audio.src = songs[0];

        // Show song name
        const name = decodeURIComponent(songs[0].split("/").pop());
        const cleaname = name
            .replace(/-\d+\.mp3$/, "")
            .replace(/-/g, " ")
            .replace(/\.mp3$/, "")
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim();
        document.querySelector(".songinfo").textContent = cleaname;

        // Show duration after metadata loads
        audio.addEventListener("loadedmetadata", () => {
            const total = formatTime(audio.duration);
            document.querySelector(".songtime").textContent = `0:00 / ${total}`;
        });
    }

    // ... rest of your forEach(song) code


    console.log("Songs array:", songs);

    const ul = document.querySelector(".songlist ul");

   songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.classList.add("flex", "justify-between", "items-center", "p-2");

    const filename = decodeURIComponent(song.split("/").pop());
    const songTitle = filename
        .replace(/-\d+\.mp3$/, "")     // remove -12345.mp3
        .replace(/-/g, " ")            // dashes to spaces
        .replace(/\.mp3$/, "")         // remove .mp3
        .replace(/\b\w/g, c => c.toUpperCase()) // capitalize each word
        .trim();

    // Music icon
    const img = document.createElement("img");
    img.src = "music.svg";
    img.classList.add("invert");
    img.width = 24;

    // Info div (only song title)
    const infoDiv = document.createElement("div");
    infoDiv.className = "info";
    infoDiv.innerHTML = `
        <div>${songTitle}</div>
    `;
// Create wrapper div with class 'play'
const playWrapper = document.createElement("div");
playWrapper.classList.add("playnow");

// SVG Play Button
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "45");
svg.setAttribute("height", "40");
svg.setAttribute("viewBox", "0 0 24 24");
svg.innerHTML = `
  <circle cx="12" cy="12" r="12" fill="#1fdf64" />
  <g transform="translate(4, 4) scale(0.67)">
    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="black" />
  </g>
`;
svg.style.cursor = "pointer";

// Add event listener to play the song
svg.addEventListener("click", () => {
  
  playSong(index);
  
});

// Append SVG into wrapper
playWrapper.appendChild(svg);


   
    // Build li
    li.appendChild(img);
    li.appendChild(infoDiv);

    // Finally, append the wrapper to your `li`
li.appendChild(playWrapper);

   

    document.querySelector(".songlist ul").appendChild(li);
});

    const controlButtons = document.querySelectorAll('.songbutton img');

    const prevButton = controlButtons[0];
    const playButton = controlButtons[1];
    const nextButton = controlButtons[2];

    // 🎵 Play / Pause
   playButton.addEventListener("click", () => {
    if (songs.length === 0) return;

    if (!isPlaying) {
        if (!audio.src) {
            playSong(currentSongIndex);
            playButton.src = "pause.svg";
        } else {
            audio.play();
            isPlaying = true;
            
            // ✅ FIX: Re-show the song title
            const name = decodeURIComponent(songs[currentSongIndex].split("/").pop());
            const cleaname = name
        .replace(/-\d+\.mp3$/, "")     // remove -12345.mp3
        .replace(/-/g, " ")            // dashes to spaces
        .replace(/\.mp3$/, "")         // remove .mp3
        .replace(/\b\w/g, c => c.toUpperCase()) // capitalize each word
        .trim();





            document.querySelector(".songinfo").textContent = cleaname;
            playButton.src= "pause.svg";
        }
    } else {
        audio.pause();
        isPlaying = false;
        playButton.src = "https://img.icons8.com/sf-black-filled/64/play.png"
        // Clear title when paused
        document.querySelector(".songinfo").textContent = "";
        document.querySelector(".songtime").textContent= "";
        
    }

   
});

    // ⏮️ Previous
    prevButton.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    });

    // ⏭️ Next
    nextButton.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    });
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// 🎧 Update current time during playback

audio.addEventListener("timeupdate", () => {
    if (!isNaN(audio.duration) && isPlaying) {
        const current = formatTime(audio.currentTime);
        const total = formatTime(audio.duration);
        document.querySelector(".songtime").textContent = `${current} / ${total}`;

        document.querySelector(".circle").style.left= (audio.currentTime/audio.duration)*100+"%";
    }
});

document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left = percent + "%";
    audio.currentTime = ((audio.duration)*percent/100);
})




function playSong(index) {
    audio.src = songs[index];
    audio.play();
    isPlaying = true;
    
    currentSongIndex = index;

    const name = decodeURIComponent(songs[index].split("/").pop());
    const cleaname = name
        .replace(/-\d+\.mp3$/, "")     // remove -12345.mp3
        .replace(/-/g, " ")            // dashes to spaces
        .replace(/\.mp3$/, "")         // remove .mp3
        .replace(/\b\w/g, c => c.toUpperCase()) // capitalize each word
        .trim();




    document.querySelector(".songinfo").textContent = cleaname;
    console.log("Now playing:", name);

    const playButton = document.querySelector("#play");
    playButton.src = "pause.svg";


    
audio.addEventListener("loadedmetadata", showTotalDuration);

function showTotalDuration() {
    if (isPlaying) {
        const total = formatTime(audio.duration);
        document.querySelector(".songtime").textContent = `0:00 / ${total}`;
    }
}

audio.removeEventListener("loadedmetadata", showTotalDuration);
audio.addEventListener("loadedmetadata", showTotalDuration);
 
}


//Add an event listener for hamburger
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".hamburger").addEventListener("click", () => {
    console.log("hamburger clicked");
    document.querySelector(".left").classList.toggle("show");
  });
});


//Add an event listener for Close button
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".close").addEventListener("click", () => {
    console.log("close clicked");
    document.querySelector(".left").classList.remove("show");
  });
});


main();


// //Add an event listener for hamburger
// document.addEventListener("DOMContentLoaded", () => {
//   document.querySelector(".hamburger").addEventListener("click", () => {
//     console.log("hamburger clicked");
//     document.querySelector(".left").classList.toggle("show");
//   });
// });


// //Add an event listener for Close button
// document.addEventListener("DOMContentLoaded", () => {
//   document.querySelector(".close").addEventListener("click", () => {
//     console.log("close clicked");
//     document.querySelector(".left").style.left = "-100%";
//   });
// });
