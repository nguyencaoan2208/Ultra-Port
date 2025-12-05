  
// Scroll 
  const SNAP_DURATION = 700; // thời gian cuộn mượt (ms)
  let isPageSnapping = false;

  const allSections = [...document.querySelectorAll("section")];

  function getActiveSectionIndex() {
    const vhCenter = window.innerHeight * 0.5;

    // Ưu tiên section đang cắt qua tâm viewport
    let activeIndex = allSections.findIndex(sec => {
      const rect = sec.getBoundingClientRect();
      return rect.top <= vhCenter && rect.bottom >= vhCenter;
    });

    // Nếu không tìm được (trường hợp hiếm) → lấy section có top gần nhất
    if (activeIndex === -1) {
      let minDist = Infinity;
      allSections.forEach((sec, i) => {
        const rect = sec.getBoundingClientRect();
        const dist = Math.abs(rect.top);
        if (dist < minDist) {
          minDist = dist;
          activeIndex = i;
        }
      });
    }

    return activeIndex;
  }

  function scrollToSection(section) {
    if (!section) return;
    isPageSnapping = true;

    window.scrollTo({
      top: section.offsetTop,
      behavior: "smooth"
    });

    setTimeout(() => {
      isPageSnapping = false;
    }, SNAP_DURATION);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (isPageSnapping) return;

      const dir = e.deltaY > 0 ? "down" : "up";

      const activeIndex = getActiveSectionIndex();
      if (activeIndex === -1) return;

      const activeSection = allSections[activeIndex];

      // ❌ Không snap khi đang ở section trượt text,
      // để phần JS trượt text xử lý wheel
      if (activeSection.classList.contains("scroll-text-section")) return;

      // Tính next / prev
      let target = null;
      if (dir === "down" && activeIndex < allSections.length - 1) {
        target = allSections[activeIndex + 1];
      } else if (dir === "up" && activeIndex > 0) {
        target = allSections[activeIndex - 1];
      }

      if (target) {
        e.preventDefault();
        scrollToSection(target);
      }
    },
    { passive: false }
  );


//   Scroll Text
  const SCROLL_DELAY = 600; // chỉnh thời gian đứng giữa mỗi text (ms)

  document.querySelectorAll(".scroll-text-section").forEach((section) => {
    const texts = section.querySelectorAll(".scroll-text");

    let currentTextIndex = -1;
    let isLocked = false;
    let startY = 0;

    function updateStack() {
      texts.forEach((el, i) => {
        el.classList.remove("show", "old");

        if (i < currentTextIndex) el.classList.add("old");
        if (i === currentTextIndex) el.classList.add("show");
      });
    }

    // ✅ Kiểm tra section có đang thực sự trong viewport không (>= 60%)
    function isSectionActive() {
      const rect = section.getBoundingClientRect();
      const viewHeight = window.innerHeight || document.documentElement.clientHeight;

      const visibleHeight =
        Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0);

      return visibleHeight / rect.height >= 0.6;
    }

    function canControl(direction) {
      // ở text cuối, scroll xuống → cho thoát
      if (direction === "down" && currentTextIndex >= texts.length - 1) return false;

      // ở text đầu, scroll lên → cho thoát
      if (direction === "up" && currentTextIndex <= -1) return false;

      return isSectionActive();
    }

    function handleWheel(e) {
      const direction = e.deltaY > 0 ? "down" : "up";

      if (!canControl(direction)) return;

      e.preventDefault();
      if (isLocked) return;
      isLocked = true;

      if (direction === "down" && currentTextIndex < texts.length - 1) {
        currentTextIndex++;
      } 
      else if (direction === "up" && currentTextIndex >= 0) {
        currentTextIndex--;
      }

      updateStack();

      setTimeout(() => {
        isLocked = false;
      }, SCROLL_DELAY);
    }

    window.addEventListener("wheel", handleWheel, { passive: false });

    // ===== MOBILE TOUCH =====
    section.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    section.addEventListener("touchmove", (e) => {
      if (isSectionActive()) e.preventDefault();
    }, { passive: false });

    section.addEventListener("touchend", (e) => {
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      if (Math.abs(diff) < 50) return;

      const direction = diff > 0 ? "down" : "up";
      if (!canControl(direction)) return;

      if (isLocked) return;
      isLocked = true;

      if (direction === "down" && currentTextIndex < texts.length - 1) {
        currentTextIndex++;
      } 
      else if (direction === "up" && currentTextIndex >= 0) {
        currentTextIndex--;
      }

      updateStack();

      setTimeout(() => {
        isLocked = false;
      }, SCROLL_DELAY);
    });
  });


//   Solution scroll

  const items = document.querySelectorAll(".service-item");
  const previewImage = document.getElementById("servicePreviewImage");

  items.forEach(item => {
    item.addEventListener("mouseenter", () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const img = item.getAttribute("data-image");
      previewImage.src = img;
    });
  });