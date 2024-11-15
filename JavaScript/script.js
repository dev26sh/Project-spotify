console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00 : 00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let aS = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < aS.length; index++) {
        const element = aS[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" width="34" src="icons/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Dev</div>
                            </div>
                            <div class="PlayNow">
                                <span>Play Now</span>
                                <img class="invert" src="icons/play.svg" alt="">
                            </div></li>`;
    }

    //attach an event listener to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/Allsongs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div);
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors);
    let cardContainer = document.querySelector(".cardContainer")
    //console.log(cardContainer);

    let array = Array.from(anchors)
    // console.log(array);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // console.log(e);
        if (e.href.includes("/Allsongs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[1]
            // Get the metadata of the folder
            let a = await fetch(`/Allsongs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" xml:space="preserve">
                                <circle cx="30" cy="30" r="30" fill="#1fdf64" />
                                <polygon points="24,16.893 43.225,30 24,43.107" fill="#000000" />
                        </svg>
                    </div>

                <img src="/Allsongs/${folder}/cover.jpeg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Allsongs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
async function main() {

    //get the list of all the songs
    await getSongs("Allsongs/cs")
    // console.log(songs);
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()


    //Attach an event listener to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "icons/pause.svg"
        } else {
            currentSong.pause()
            play.src = "icons/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to previous 
    previous.addEventListener("click", () => {
        console.log("previous clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("next clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {    //HTMLCollection does not have an addEventListener method; only individual elements have this method.
        console.log("setting volume to ", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >= 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("icons/mute.svg", "icons/volume.svg")
        }
    })

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        // console.log("changing", e.target.src);
        if (e.target.src.includes("icons/volume.svg")) {
            e.target.src = e.target.src.replace("icons/volume.svg", "icons/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = e.target.src.replace("icons/mute.svg", "icons/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    // Check if a user is logged in
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        updateUIForLoggedInUser(loggedInUser);
    }
}

main()
function updateUIForLoggedInUser(user) {
    // Hide login and signup buttons
    const buttons = document.querySelector('.buttons');
    if (buttons) {
        buttons.style.display = 'none';
    }

    // Create user info container
    const userInfo = document.createElement('div');
    userInfo.classList.add('user-info');
    userInfo.innerHTML = `
        <img src="icons/user.svg" alt="User Icon" class="invert" width="30">
        <div class="dropdown-content">
            <button id="signOutButton">Sign Out</button>
        </div>
        <span>${user.username}</span>
    `;

    // Toggle dropdown on user icon click
    userInfo.addEventListener('click', function (event) {
        event.stopPropagation();
        this.classList.toggle('active');
    });

    // Append user info to header
    const header = document.querySelector('.header');
    if (header) {
        header.appendChild(userInfo);
    }

    // Sign-out functionality
    document.getElementById('signOutButton').addEventListener('click', function () {
        // Clear user data
        localStorage.removeItem('loggedInUser');
        // Redirect to login page
        window.location.href = 'login.html';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
        userInfo.classList.remove('active');
    });
}