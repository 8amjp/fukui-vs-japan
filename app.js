/*
 * 福井県 VS 日本
 *
 * Copyright 2015 8am.
 * http://8am.jp/
 *
 * 「福井県勢要覧」の統計項目について、福井県の順位を選ぶクイズアプリです。
 * 「福井県オープンデータライブラリ」で公開されている「福井県勢要覧」のオープンデータを使用しています。
 */

$(function() {
    
    var data = {}; // 全データ格納
    var list;      // 適切な問題のみ格納
    var questions; // 10問分の問題を格納
    var mode;
    var score;
    var numOfQuestion = 10;
    var config = {
        "ranking": {
            "question": "福井県は47都道府県中何位？",
            "options": [
                {
                    "label": "1～5位"
                },
                {
                    "label": "6～20位"
                },
                {
                    "label": "21～40位"
                },
                {
                    "label": "41～47位"
                }
            ]
        },
        "vsjapan": {
            "question": "高いのはどっち？",
            "options": [
                {
                    "label": "福井県",
                    "icon": "./lib/fukui.png"
                },
                {
                    "label": "全国",
                    "icon": "./lib/japan.png"
                }
            ]
        }
    };
    var $button = 
        $("<button/>")
        .attr("role", "option")
        .append( $("<p/>").addClass("label") )
        .append( $("<div/>").addClass("icon-container") )
        .append( $("<p/>").addClass("value").attr("role", "value") );
        
    init();

    // 問題のチョイス、スタート画面表示
    function ready() {
        $("#preface").show();
        $("#question").hide();
        $("#options").hide();
        $("#explanation").hide();
        $("#console").hide();
        $("#result").hide();

        questions = [];
        while(questions.length < numOfQuestion) {
            questions.push( list.splice( Math.random() * list.length, 1)[0] );
        }
         // モード選択
        $("[role=select]").on("click", function() {
            $("[role=select]").off();
            mode = $(this).data("mode");
            start();
        });
    }

    // クイズ開始
    function start() {
        $("#options").empty();
        var c = config[mode];
        $("#question-text").text( c.question );
        $.each( c.options, function() {
            var e = $button.clone().addClass(mode);
            e.find(".label").text( this.label );
            if (this.icon) e.find(".icon-container").append( $(new Image()).attr("src", this.icon).addClass("icon") );
            $("#options").append(e);
    });

        $("#preface").hide();
        $("#question").show();
        $("#options").show();
        $("#explanation").show();
        $("#console").show();
        $("#result").hide();

        score = 0;
        question();
    }

    // 出題
    function question() {
        $("#play").css("visibility", "hidden");
        $("[role=option]")
            .removeClass("correct")
            .removeClass("incorrect")
            .removeClass("selected")
            .removeClass("unselected")
            .prop("disabled", false);

        var q = questions.shift();
        $("#num").text( 10 - questions.length );
        $("#item").text( q.item );
        $("#unit").text( q.unit );
        $("[role=value]").css("visibility", "hidden");

        switch (mode){
            case "ranking":
                var rank = Number(q.rank);
                if (rank <= 5) {
                    var correct = 0;
                } else if (rank <= 20) {
                    var correct = 1;
                } else if (rank <= 40) {
                    var correct = 2;
                } else {
                    var correct = 3;
                }
                break;
            case "vsjapan":
                var correct = ( Number(q.pref) > Number(q.national) ) ? 0 : 1;
                $.each( [q.pref, q.national], function(i, e) {
                    $("[role=value]").eq(i).text(e);
                });
                break;
        }

        $("#pref").text( q.pref );
        $("#rank").text( q.rank );
        $("#explanation").css("visibility", "hidden");
        $("[role=option]")
            .eq(correct).addClass("correct")             // 正解の選択肢は青く強調表示
            .siblings().not(this).addClass("incorrect"); // 不正解の選択肢は赤く強調表示

        $("[role=option]").on("click", function() { // 選択したら判定へ
            $("[role=option]").off().prop("disabled", true);
            judge($(this));
        });
    }

    // 判定
    function judge($selected) {
        $selected.addClass("selected")
                        .siblings().not(this).addClass("unselected"); // 選択したボタン、しなかったボタン双方にクラス追加
        $("[role=value]").css("visibility", "visible");
        $("#explanation").css("visibility", "visible");
        if ( $selected.hasClass("correct") ) score++; // 正解なら1点追加
        if (questions.length == 0) { // 問題がなくなったら採点へ
            mark();
        } else {
        $("#play").css("visibility", "visible").one("click", function() {
                question();
            });
        }
    }

    // 採点
    function mark() {
        $("#score").text(score);
        $("#console").hide();
        $("#result").show();
        $("#retry").one("click", function() {
            ready();
        });
    }

    // 初期化
    function init() {
        $("#preface").hide();
        $("#question").hide();
        $("#options").hide();
        $("#explanation").hide();
        $("#console").hide();
        $("#result").hide();

        getData()
        .done(function() {
            list = [];
            $.each( data, function(i, e) {
                if ( !(isNaN(e.pref)) && !(isNaN(e.national)) ) { // 値が数値でないものは除外
                    if ( e.pref != e.national ) { // 値がおなじものも除外
                        list.push(e);
                    }
                }
            });
            ready();
        });
    }

    // データ取得
    function getData() {
        var deferred = new $.Deferred;
        $.ajax(
            "./json.php",
            {
                dataType: "jsonp",
                jsonpCallback: "kensei_youran"
            }
        )
        .done(function( json ) {
            data = json;
            deferred.resolve();
        });
        return deferred.promise();
    }


});