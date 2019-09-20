const DEFAULT_FACING_MODE = 'ENVIRONMENT';

const FACING_MODES = JslibHtml5CameraPhoto.FACING_MODES;
const IMAGE_TYPES = JslibHtml5CameraPhoto.IMAGE_TYPES;

const CAMERA_CONFIG = {
  sizeFactor: 1,
  imageType: IMAGE_TYPES.JPG,
  imageCompression: 0.8
};

const $form = $('#main');
const $video = $('#video');
const $preview = $('#preview');
const $cameraSwitchers = $('#frontCamera, #rearCamera');
const $cameraAccessError = $('#accessError');
const $turnOnMessage = $('#turnOnMessage');
const $takeAPictureButton = $('#takeAPicture');
const $takeAnotherButton = $('#takeAnother');

const cameraPhoto = new JslibHtml5CameraPhoto.default($video[0]);

if (!cameraPhoto) {
  $turnOnMessage.hide();
  $cameraAccessError.show();
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], {type: mimeString});
}

function takePhoto () {
  const dataURI = cameraPhoto.getDataUri(CAMERA_CONFIG);
  return dataURItoBlob(dataURI);
}

function initUI() {
  $form.find('.status.text-success, .status.text-danger').hide();
  $cameraAccessError.hide();
  $turnOnMessage.hide();
  $takeAnotherButton.hide();
  $preview.hide();
  $takeAPictureButton.show();
  $video.show();
}

function initCamera(facingMode = DEFAULT_FACING_MODE) {
  cameraPhoto.startCameraMaxResolution(FACING_MODES[facingMode])
    .then(function () {
      $turnOnMessage.hide();
      $takeAPictureButton.attr('disabled', false);
      $video.show();
    })
    .catch(function (error) {
      console.error('Camera not started!', error);
      $takeAPictureButton.attr('disabled', true);
      $turnOnMessage.hide();
      $cameraAccessError.show();
    });
}

$form.submit(function (e) {
  e.preventDefault();

  $form.find('.status.text-success, .status.text-danger').hide();
  $form.find('.spinner').show();

  const photo = takePhoto();
  const formData = new FormData();
  formData.append("file", photo, 'picture.jpg');

  return $.post({
    url: 'upload.php',
    data: formData,
    cache: false,
    processData: false,
    contentType: false,
  })
    .then(function (uploadUrl) {
      $form.find('.status.text-success').show();
      $form.find('.spinner').hide();
      $takeAPictureButton.hide();
      $takeAnotherButton.show();
      $video.hide();
      $preview.attr('src', uploadUrl + '?_=' + Math.random());
      $preview.show();
    })
    .catch(function (e) {
      console.error(e);
      $form.find('.status.text-danger').show();
      $form.find('.spinner').hide();
    });
});


$cameraSwitchers.click(function () {
  $cameraSwitchers.toggleClass('btn-primary').toggleClass('btn-outline-primary');
  initUI();
  initCamera($(this).attr('data-mode'));
});

$takeAnotherButton.click(initUI);

initCamera();
