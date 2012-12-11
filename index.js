/**
 * ToDo 管理アプリ
 * @author edo_m18
 */
(function(win, doc, $, exports) {

    var ToDoApp = {
        STORAGE  : window.localStorage,
        DBNAME   : 'todo',
        INDEX    : 0,
        CONTAINER: 'todo',
        CURRENT  : null,
        ADDFLG   : false,

        /**
         * 初期化
         * 初期化はINDEXの取得、設定
         */
        initialize: function() {

            this.INDEX = this.getIndex() || 0;
        },

        /**
         * ToDoをリストに追加する
         *
         * @param {String} txt ToDoに設定するテキスト.
         * @param {Number} id ToDoのユニークID
         */
        addToDo: function(txt, id){

            var data;

            /**
             * 渡されたIDのデータを取得
             * もしデータがあればそれを更新する
             */
            data = this.getData(id);

            //各プロパティの正規化
            data || (data = {});
            data.groupID || (data.groupID = 0);
            data.complete || (data.complete = 0);

            data.txt = txt;
            data.tid = id;

            //設定した情報を保存
            this.setData(data, id);
            this.update();
            this.ADDFLG = false;
        },

        /**
         * ToDoを完了状態にする
         *
         * @param {Number} id 完了にする対象のToDo ID
         */
        completeToDo: function(id) {

            var data = this.getData(id);

            //コンプリートフラグを1(=完了)に
            data.complete = 1;

            //フラグを更新してデータを保存
            this.setData(data, id);
            this.update();
        },

        /**
         * ToDoを削除する
         *
         * @param {Number} id 削除するToDoのID
         */
        removeToDo: function(id) {

            var data,
                i = 0, l;

            if (!confirm('このToDoを削除しますか？')) {
                return false;
            }

            //いったん全データを取得
            data = this.getData();

            //該当するデータを検索
            for (l = data.length; i < l; i++) {
                if (data[i].tid == id) {
                    data.splice(i,1);
                    break;
                }
            }

            //更新したデータリストを保存
            this.setData(data);
            this.update();
        },

        /**
         * ToDoを変更
         * 
         * @param {Number} id 変更するToDoのID
         */
        changeToDo: function(id) {

            var txt = $('input.todoTxt', '#todo' + id).val();

            this.addToDo(txt, id);
        },

        /**
         * ToDoの追加フォームを生成する
         */
        createToDoForm: function() {

            var id;

            if (this.isID(this.CURRENT) || this.ADDFLG) {
                return;
            }

            this.ADDFLG = true;

            if ($('#noToDo').length === 1) {
                $('#noToDo').remove();
            }

            id = this.getIndex();
            id = !isNaN(id) ? id : 0;

            $('#todo').append([
                '<div id="todo' + id + '" class="todoInput">',
                    '<p>',
                        '<input type="text" class="todoTxt" value="" placeholder="ToDoアイテム" /> ',
                        '<input type="button" value="更新" onclick="ToDoApp.changeToDo(' + id + ');" /> ',
                        '<input type="button" value="キャンセル" onclick="ToDoApp.cancel();" />',
                    '</p>',
                '</div>'].join(''));

            //生成したフォームにフォーカスを当てる
            $('input.todoTxt', '#todo' + id).focus();
        },

        /**
         * ToDoの更新フォームを生成する
         */
        replaceToDoForm: function(item,evt) {

            var id, data;

            /**
             * クリックされた対象がinput要素か、
             * すでに完了しているものの場合はなにもしない
             */
            if (evt.target.nodeName.toLowerCase() === 'input') {
                return;
            }
            if (evt.currentTarget.className.indexOf('complete') !== -1) {
                return;
            }

            if (!this.isID(this.CURRENT)) {
                id = parseInt($(item).attr('data-id'),10);
                data = this.getData(id);

                if (!isNaN(id) && data) {
                    $(item)
                    .after([
                        '<div id="todo' + id + '" class="todoInput">',
                            '<p>',
                                '<input type="text" class="todoTxt" value="' + data.txt + '" /> ',
                                '<input type="button" value="更新" onclick="ToDoApp.changeToDo(' + id + ');" /> ',
                                '<input type="button" value="キャンセル" onclick="ToDoApp.cancel();" />',
                            '</p>',
                        '</div>'].join(''))
                    .remove();
                }
            }
        },

        /**
         * 現在のindex数を取得する
         */
        getIndex: function() {

            var o = this.getData();

            return o ? o.length : null;
        },

        /**
         * ToDoデータをlocalStorageから取得する
         *
         * @param {Number} id 取得したいToDoのID
         * @returns {Object} 取得したToDoデータリスト
         */
        getData: function(id) {

            var db = this.STORAGE[this.DBNAME],
                json,
                i = 0, l;

            //データが存在していなければ初期化を実行する
            (db) || this.clear();

            //JSONデータをチェック。データが存在しなければ正規化
            json = JSON.parse(this.STORAGE[this.DBNAME]);
            (json) || (json = {});
            (json.data) || (json.data = []);

            //IDが指定されていなかったらデータすべてを返す
            if (!this.isID(id)) {
                return json.data;
            }

            //指定されたIDのデータを返す
            for (l = json.data.length; i < l; i++ ) {
                if (json.data[i].tid == id) {
                    return json.data[i];
                }
            }

            //該当IDが存在しなければnullを返す
            return null;
        },

        /**
         * @param {Object} data
         * @param {Number} id
         */
        setData: function(data, id) {

            var d,
                i = 0, l;

            if (!this.isID(id)) {
                this.STORAGE[this.DBNAME] = JSON.stringify({data: data});
            }
            else {
                d = this.getData();
                update: {
                    for (l = d.length; i < l; i++) {
                        if (d[i].tid == id) {
                            d[i] = data;
                            break update;
                        }
                    }

                    d[d.length] = data;
                }

                this.STORAGE[this.DBNAME] = JSON.stringify({data:d});
            }
        },


        /**
         * idが数値かどうかを判定
         */
        isID: function(id) {

            return typeof id === 'number';
        },


        /**
         * ToDoリストをアップデートする
         *
         * @param {Number} id アップデート対象のToDo ID
         */
        update: function(id) {

            var data,
                groups = {}, index = 1, gid,
                i = 0, l,
                compFlg, element, ele,
                that = this;

            if (this.isID(id)) {
                data = this.getData(id);
            }
            else {
                data = this.getData();

                //いったん全ToDoデータを画面から削除
                $('#' + this.CONTAINER).html('');

                //ToDoがひとつも登録されていなければそれを表示
                if (!data || !data[0]) {
                    $('#todo').append('<p id="noToDo">ToDoが登録されていません。</p>');
                    return false;
                }


                //完了状態を元にソート（完了したものがリストの下に移動するように）
                data = data.sort(function(a, b) {
                    return a.complete - b.complete;
                });

                for (l = data.length; i < l; i++) {
                    gid = 'g' + data[i].groupID;

                    if (!groups[gid]) {
                        groups[gid] = $('<div class="groupBox" />');
                        groups[gid].attr('data-gid', data[i].groupID);
                        groups[gid].append('<p class="ttlGroup">ToDo List</p>');
                    }

                    $('#' + this.CONTAINER).append(groups['g' + data[i].groupID]);

                    //完了状態をチェック
                    compFlg = data[i].complete ? ' complete' : '';

                    element = [
                        '<div id="todo{{id}}" class="{{class}}" data-id="{{id}}" draggable="true">',
                            '<span class="todoTxtItem">{{todotext}}</span>',
                            '<div class="todoCtrl">',
                                '<input type="button" value="完了" onclick="ToDoApp.completeToDo({{id}});" class="btnComp" /> ',
                                '<input type="button" value="削除" onclick="ToDoApp.removeToDo({{id}});" class="btnDel" class="btnDel" />',
                            '</div>',
                            '<div class="todoCtrl2">',
                                '<input type="button" value="再開"  onclick="ToDoApp.resume({{id}});" class="btnResume" />',
                            '</div>',
                        '</div>'
                    ].join('');
                        
                    //要素のテンプレートからそれぞれToDoのデータで置き換え
                    element = element.replace(/{{id}}/ig, data[i].tid);
                    element = element.replace(/{{class}}/ig, 'todoItem' + compFlg);
                    element = element.replace(/{{todotext}}/ig, data[i].txt);

                    //生成したToDoアイテムをリストに追加
                    ele = groups['g' + data[i].groupID].append(element);
                }

                /**
                 * 生成したToDoアイテムにクリックと
                 * hoverイベントを設定
                 */
                $('.todoItem')
                    .click(function(e) {

                        that.replaceToDoForm(this, e);
                    })
                    .hover(function() {

                        that.status('クリックで編集できます。');
                    },
                    function() {

                        that.statusClear();
                    });
            }
        },


        /**
         * 完了状態にしたToDoを再開する（完了状態を解除する）
         *
         * @param {Number} id 完了状態をオフにするToDoのID
         */
        resume: function(id) {

            var data = this.getData(id);

            //完了状態をオフに
            data.complete = 0;

            //完了状態を更新してアップデート
            this.setData(data, id);
            this.update();
        },

        /**
         * 更新・追加フォームの状態をキャンセルする
         */
        cancel: function() {

            this.update();
            this.ADDFLG = false;
        },

        /**
         * データベース（localStorage）とリストを初期化（クリア）する
         */
        clear: function() {

            this.STORAGE[this.DBNAME] = JSON.stringify({data:[]});
            this.INDEX = 0;

            //画面に表示しているリストを削除
            $('#' + this.CONTAINER).html('');
        },

        /**
         * 全ToDoを削除する
         */
        clearAction: function() {

            if (this.isID(this.CURRENT)) {
                return;
            }

            if (confirm('ToDoをクリアします。この処理は取り消せません。本当に実行しますか？')) {
                this.clear();
                this.update();
            }
        },

        /**
         * ステータスバーにメッセージを表示
         *
         * @param {String} mes 表示するメッセージ
         */
        status: function(mes) {
            $('#status').html(mes);
        },
        statusClear: function() {
            $('#status').html('');
        }
    };

    //アプリの初期化を実行
    ToDoApp.initialize();

    /* ----------------------------------------------------------------------------------
       EXPORT
       グローバルからアクセスできるように変数をエクスポート
    ------------------------------------------------------------------------------------- */
    exports.ToDoApp = ToDoApp;

}(window, document, jQuery, window));

//ページ読み込み後に、アプリを実行する
$(function() { ToDoApp.update(); });
