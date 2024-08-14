document.addEventListener('DOMContentLoaded', () => {
    const topRow = document.querySelector('.top-row .images-wrapper');
    const middleRow = document.querySelector('.middle-row .images-wrapper');
    const bottomRow = document.querySelector('.bottom-row .images-wrapper');
    const specialInner = document.querySelector('.special-inner img');
    const dateDiv = document.querySelector('.date');
    const addressDiv = document.querySelector('.address');
    const newImgButton = document.getElementById('newImg');
    const loadingScreen = document.getElementById('loading-screen');
    const content = document.getElementById('content');
    const passwordPrompt = document.getElementById('password-prompt');
    const submitPasswordButton = document.getElementById('submit-password');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    const correctPassword = '220724';
    let imagePaths = [];
    let heicPaths = [];
    let imageCountPerRow = 10;
    let imagesLoaded = 0;
    const totalImages = imageCountPerRow * 3;

    // 무작위로 이미지를 선택하여 행에 추가하는 함수
    function addImages(row, imagePaths, imageCount) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < imageCount; i++) {
            const img = document.createElement('img');
            const randomIndex = Math.floor(Math.random() * imagePaths.length);
            img.src = imagePaths[randomIndex];
            img.onload = imageLoaded;
            fragment.appendChild(img);
        }
        row.appendChild(fragment);
        row.appendChild(fragment.cloneNode(true)); // 이미지를 복제하여 연속적으로 보이도록 설정
    }

    // path_png.json 파일에서 이미지 경로를 가져오는 함수
    async function fetchImagePaths() {
        try {
            const response = await fetch('path_png.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            imagePaths = await response.json();
            return imagePaths;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    // path.json 파일에서 HEIC 이미지 경로를 가져오는 함수
    async function fetchHeicPaths() {
        try {
            const response = await fetch('path.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            heicPaths = await response.json();
            return heicPaths;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    // 모든 이미지가 로드되었는지 확인하는 함수
    function imageLoaded() {
        imagesLoaded++;
        if (imagesLoaded >= totalImages) {
            setTimeout(() => {
                loadingScreen.classList.add('hide');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 1000); // Matches the duration of the CSS transition
            }, 500); // Optional delay before starting fade out
        }
    }

    // JSON 파일에서 이미지를 가져와 각 행에 무작위로 이미지를 추가하는 함수
    async function initializeImages() {
        await fetchImagePaths();
        if (imagePaths.length > 0) {
            addImages(topRow, imagePaths, imageCountPerRow);
            addImages(middleRow, imagePaths, imageCountPerRow);
            addImages(bottomRow, imagePaths, imageCountPerRow);
        }
    }

    // 날짜 형식을 변환하는 함수
    function formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        return new Date(date).toLocaleDateString('ko-KR', options);
    }

    // 좌표를 주소로 변환하는 함수
    async function getAddress(latitude, longitude) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('There was a problem with the geocoding operation:', error);
            return 'Unknown Address';
        }
    }

    // Special inner 이미지를 설정하고 메타데이터를 추출하는 함수
    async function initializeSpecialImage() {
        await fetchHeicPaths();
        if (heicPaths.length > 0) {
            const randomIndex = Math.floor(Math.random() * heicPaths.length);
            let heicPath = heicPaths[randomIndex];
            // 경로 수정: ./imgs를 imgs_png로, .heic를 .png로 변경
            let pngPath = heicPath.replace('./imgs', 'imgs_png').replace('.HEIC', '.png');
            
            // Fade out current image
            specialInner.classList.remove('show');
            
            // exifr 라이브러리를 사용하여 메타데이터 추출
            const exifData = await exifr.parse(heicPath);
            if (exifData) {
                dateDiv.textContent = formatDate(exifData.DateTimeOriginal) || 'Unknown Date';
                
                if (exifData.latitude && exifData.longitude) {
                    const address = await getAddress(exifData.latitude, exifData.longitude);
                    addressDiv.textContent = address;
                } else {
                    addressDiv.textContent = 'Unknown Address';
                }
            }

            // Wait for fade out transition to complete before changing the image source
            setTimeout(() => {
                specialInner.src = pngPath;
                specialInner.onload = () => {
                    specialInner.classList.add('show');
                };
            }, 1000); // Matches the duration of the CSS transition
        }
    }

    // 이미지 초기화
    initializeImages();
    initializeSpecialImage();

    // 버튼 클릭 시 새로운 이미지 로드
    newImgButton.addEventListener('click', () => {
        initializeSpecialImage();
    });

    const seeLetter = document.getElementById('triggerLetter');
    const letterDiv = document.getElementById('letter-div');
    const closeLetter = document.getElementById('close-letter');
    
    // 편지 열기 버튼 클릭 시 fade in 효과
    seeLetter.addEventListener('click', () => {
        letterDiv.classList.add('show');
    });

    // 편지 닫기 버튼 클릭 시 fade out 효과
    closeLetter.addEventListener('click', () => {
        letterDiv.classList.remove('show');
        setTimeout(() => {
            letterDiv.style.display = 'none';
        }, 1000); // Matches the duration of the CSS transition
    });

    // 비밀번호 제출 버튼 클릭 이벤트 핸들러
    submitPasswordButton.addEventListener('click', () => {
        if (passwordInput.value === correctPassword) {
            passwordPrompt.classList.add('hide');
            setTimeout(() => {
                passwordPrompt.style.display = 'none';
                loadingScreen.classList.remove('hide');
                content.classList.remove('hide');
            }, 500); // Optional delay for smoother transition
        } else {
            passwordError.style.display = 'block';
            passwordError.textContent = '비밀번호가 틀렸습니다. 다시 시도하세요.';
        }
    });
});
