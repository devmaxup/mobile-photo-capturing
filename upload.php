<?php
const UPLOADS_DIR = 'uploads/';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function validate_file($file) {
  if (
    !isset($file['error']) ||
    is_array($file['error'])
  ) {
    throw new RuntimeException('Invalid parameters.');
  }

  switch ($file['error']) {
    case UPLOAD_ERR_OK:
      break;
    case UPLOAD_ERR_NO_FILE:
      throw new RuntimeException('No file sent.');
    case UPLOAD_ERR_INI_SIZE:
    case UPLOAD_ERR_FORM_SIZE:
      throw new RuntimeException('Exceeded filesize limit.');
    default:
      throw new RuntimeException('Unknown errors.');
  }

  if ($file['size'] > MAX_FILE_SIZE) {
    throw new RuntimeException('Exceeded filesize limit.');
  }
}

header('Content-Type: text/plain; charset=utf-8');
try {
  // Validate inputs
  validate_file($_FILES['file']);

  $filename = basename($_FILES["file"]["name"]);
  $move_to_path = UPLOADS_DIR . $filename;

  // move uploaded file
  $was_moved = move_uploaded_file(
    $_FILES['file']["tmp_name"],
    $move_to_path
  );
  if (!$was_moved) {
    throw new RuntimeException('Can`t move file');
  }

  echo $move_to_path;

} catch (Throwable $e) {
  header('HTTP/1.1 500 Internal Server Error');
  echo $e->getMessage();
}
