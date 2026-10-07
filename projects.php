<?php
header('Content-Type: application/json; charset=utf-8');
$dir=__DIR__.'/assets'; $web='assets/'; $allowed=['mp4','webm','mov','m4v']; $items=[];
if(is_dir($dir)){
  foreach(scandir($dir) as $file){$path=$dir.'/'.$file;if(!is_file($path))continue;$ext=strtolower(pathinfo($file,PATHINFO_EXTENSION));if(!in_array($ext,$allowed,true))continue;
    $base=pathinfo($file,PATHINFO_FILENAME);$parts=preg_split('/[-_]+/', $base);$title=ucwords(implode(' ',array_map('trim',$parts)));$category='Video Edit · Motion Graphics';
    $lower=strtolower($base);if(str_contains($lower,'gaming'))$category='Gaming Edit';elseif(str_contains($lower,'short')||str_contains($lower,'reel'))$category='Shorts / Reels';elseif(str_contains($lower,'youtube'))$category='YouTube Video';
    $items[]=['title'=>$title?:'Untitled Project','category'=>$category,'number'=>str_pad((string)(count($items)+1),2,'0',STR_PAD_LEFT),'label'=>$title?:'PROJECT','src'=>$web.rawurlencode($file)];
  }
}
echo json_encode($items,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
