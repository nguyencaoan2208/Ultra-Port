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