document.addEventListener("DOMContentLoaded", () => {
  const deployButton = document.getElementById("deployButton");
  const fairingLeft = document.getElementById("fairingLeft");
  const fairingRight = document.getElementById("fairingRight");
  const satellite = document.getElementById("satellite");
  const successModal = document.getElementById("successModal");
  const nextMissionButton = document.getElementById("nextMissionButton");
  deployButton.addEventListener("click", () => {
    // Hide the button once the sequence starts
    deployButton.style.display = "none";

    // 1. Start fairing separation
    fairingLeft.classList.add("separating");
    fairingRight.classList.add("separating");

    // 2. Reveal the satellite shortly after separation begins
    setTimeout(() => {
      satellite.style.opacity = "1";
    }, 500); // 0.5 second delay

    // 3. Deploy the satellite after the fairings are clear
    setTimeout(() => {
      satellite.classList.add("deployed");
    }, 1500); // 1.5 second delay
    setTimeout(() => {
      isLaunching = false; // Stop the rocket animation
      successModal.classList.remove("hidden"); // Show the pop-up
    }, 4000);
    setTimeout(showCompletionPopup, 7000);
  });
  /**
   * This function shows the pop-up window.
   */
  function showCompletionPopup() {
    if (successModal) {
      successModal.classList.remove("hiddenz");
    }
  }

  /**
   * This function redirects the browser to the next page.
   * IMPORTANT: Change 'index3.html' if your file has a different name!
   */
  function goToNextPage() {
    window.location.href = "index5.html";
  }

  // Add the click event listener to the button inside the pop-up
  if (nextMissionButton) {
    nextMissionButton.addEventListener("click", goToNextPage);
  }
});
