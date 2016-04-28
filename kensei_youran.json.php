<?php
header("Content-Type: application/json; charset=utf-8");

$t = new DateTime();
$lines = file('./kensei_youran_tsv.txt', FILE_IGNORE_NEW_LINES);
$json = array();
foreach ($lines as $line) {
  if ( !preg_match('/^#/', $line) ) {
    $a = explode("\t", $line);
    $json[$a[0]] = array (
      'id'        => $a[0], // ID
      'item'      => $a[1], // 項目
      'rank'      => $a[2], // 順位
      'pref'      => $a[3], // 福井県
      'national'  => $a[4], // 全国
      'unit'      => $a[5], // 単位
      'date'      => $a[6], // 年・年度、期日
    );
  }
}

echo sprintf("kensei_youran(%s)",json_encode($json));
exit;
?>