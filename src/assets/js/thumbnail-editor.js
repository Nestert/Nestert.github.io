(function () {
  'use strict';

  const editor = document.querySelector('[data-thumbnail-editor]');
  if (!editor) return;

  const imageSelect = editor.querySelector('[data-thumbnail-image-select]');
  const workspace = editor.querySelector('[data-thumbnail-workspace]');
  const emptyState = editor.querySelector('[data-thumbnail-empty]');
  const focusStage = editor.querySelector('[data-thumbnail-focus-stage]');
  const sourceImage = editor.querySelector('[data-thumbnail-source-image]');
  const previewImage = editor.querySelector('[data-thumbnail-preview-image]');
  const focusMarker = editor.querySelector('[data-thumbnail-focus-marker]');
  const xInput = editor.querySelector('[data-thumbnail-x]');
  const yInput = editor.querySelector('[data-thumbnail-y]');
  const zoomInput = editor.querySelector('[data-thumbnail-zoom]');
  const xOutput = editor.querySelector('[data-thumbnail-x-output]');
  const yOutput = editor.querySelector('[data-thumbnail-y-output]');
  const zoomOutput = editor.querySelector('[data-thumbnail-zoom-output]');
  const code = editor.querySelector('[data-thumbnail-code]');
  const copyButton = editor.querySelector('[data-thumbnail-copy]');
  const resetButton = editor.querySelector('[data-thumbnail-reset]');
  const status = editor.querySelector('[data-thumbnail-status]');

  let focusX = 50;
  let focusY = 50;
  let zoom = 100;
  let isDragging = false;

  function clampPercentage(value) {
    return Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
  }

  function clampZoom(value) {
    const number = Math.round(Number(value) || 100);
    return Math.min(300, Math.max(100, number));
  }

  function settingsText() {
    return `thumbnail_position:\n  x: ${focusX}\n  y: ${focusY}\n  zoom: ${zoom}`;
  }

  function updateUrl() {
    const url = new URL(window.location.href);
    const imagePath = imageSelect.value;

    if (imagePath) {
      url.searchParams.set('image', imagePath);
      url.searchParams.set('x', String(focusX));
      url.searchParams.set('y', String(focusY));
      url.searchParams.set('zoom', String(zoom));
    } else {
      url.searchParams.delete('image');
      url.searchParams.delete('x');
      url.searchParams.delete('y');
      url.searchParams.delete('zoom');
    }

    window.history.replaceState({}, '', url);
  }

  function renderFocus(updateAddress) {
    focusX = clampPercentage(focusX);
    focusY = clampPercentage(focusY);
    zoom = clampZoom(zoom);

    xInput.value = String(focusX);
    yInput.value = String(focusY);
    zoomInput.value = String(zoom);
    xOutput.textContent = `${focusX}%`;
    yOutput.textContent = `${focusY}%`;
    zoomOutput.textContent = `${zoom}%`;
    focusMarker.style.left = `${focusX}%`;
    focusMarker.style.top = `${focusY}%`;
    previewImage.style.objectPosition = `${focusX}% ${focusY}%`;
    previewImage.style.transformOrigin = `${focusX}% ${focusY}%`;
    previewImage.style.transform = `scale(${zoom / 100})`;
    code.textContent = settingsText();

    if (updateAddress) updateUrl();
  }

  function loadImage(imagePath, updateAddress) {
    const hasImage = Boolean(imagePath);
    workspace.hidden = !hasImage;
    emptyState.hidden = hasImage;
    status.textContent = '';

    if (!hasImage) {
      sourceImage.removeAttribute('src');
      previewImage.removeAttribute('src');
      updateUrl();
      return;
    }

    sourceImage.src = imagePath;
    previewImage.src = imagePath;
    const filename = decodeURIComponent(imagePath.split('/').pop() || 'изображение работы');
    sourceImage.alt = `Исходное изображение: ${filename}`;
    previewImage.alt = `Предпросмотр миниатюры: ${filename}`;
    renderFocus(updateAddress);
  }

  function setFocusFromPointer(event) {
    const bounds = sourceImage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    focusX = ((event.clientX - bounds.left) / bounds.width) * 100;
    focusY = ((event.clientY - bounds.top) / bounds.height) * 100;
    renderFocus(true);
  }

  imageSelect.addEventListener('change', function () {
    focusX = 50;
    focusY = 50;
    zoom = 100;
    loadImage(imageSelect.value, true);
  });

  xInput.addEventListener('input', function () {
    focusX = xInput.value;
    renderFocus(true);
  });

  yInput.addEventListener('input', function () {
    focusY = yInput.value;
    renderFocus(true);
  });

  zoomInput.addEventListener('input', function () {
    zoom = zoomInput.value;
    renderFocus(true);
  });

  focusStage.addEventListener('pointerdown', function (event) {
    isDragging = true;
    focusStage.setPointerCapture(event.pointerId);
    setFocusFromPointer(event);
  });

  focusStage.addEventListener('pointermove', function (event) {
    if (isDragging) setFocusFromPointer(event);
  });

  focusStage.addEventListener('pointerup', function (event) {
    isDragging = false;
    focusStage.releasePointerCapture(event.pointerId);
  });

  focusStage.addEventListener('pointercancel', function () {
    isDragging = false;
  });

  resetButton.addEventListener('click', function () {
    focusX = 50;
    focusY = 50;
    zoom = 100;
    renderFocus(true);
    status.textContent = 'Положение и масштаб сброшены.';
  });

  copyButton.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(settingsText());
      status.textContent = 'Настройки скопированы. Вставьте X, Y и масштаб в Pages CMS.';
    } catch (error) {
      status.textContent = 'Не удалось скопировать автоматически. Выделите настройки над кнопкой вручную.';
    }
  });

  const initialParams = new URLSearchParams(window.location.search);
  const initialImage = initialParams.get('image') || '';
  const optionExists = Array.from(imageSelect.options).some(function (option) {
    return option.value === initialImage;
  });

  if (initialImage && optionExists) {
    imageSelect.value = initialImage;
    focusX = initialParams.get('x') || 50;
    focusY = initialParams.get('y') || 50;
    zoom = initialParams.get('zoom') || 100;
    loadImage(initialImage, false);
  } else {
    loadImage('', false);
  }
}());
