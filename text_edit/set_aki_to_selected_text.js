/*
選択テキストの両脇のアキをいじる
"set Aki to both side of selected text "

使い方：
下線のアミかけ部分などの
選択テキストの両脇にそれぞれ文字前後のアキ量を設定します。
行末の欧文スペースは無視します。
選択範囲の取り方、禁則調整方式などにより思った通りにならない場合は
『アキ量を「自動」にする』にチェックをして、再度ためしてください。


動作確認：OS10.4.11 InDesign CS3

milligramme
www.milligramme.cc
*/
//おまじない
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;

if(app.selection.length==1){
        var selObj=app.selection[0];

// $.writeln(app.selection[0].constructor.name);
// $.writeln(selObj.lines.length);

        var selWho=selObj.constructor.name;
        switch(selWho){
                case "Character":
                case "Word":
                case "Text":
                case "TextStyleRange":
                case "Line":
                case "Paragraph":
                case "TextColumn":
                        akiDialog();
                        break;
                default:
                        alert("対象外オブジェクトです");
                        exit();
                }
//アキ設定ダイアログ
function akiDialog(){
var dialogObj=app.dialogs.add({name:"両脇のアキ量を設定するん",canCancel:true});
with(dialogObj){
        with(dialogColumns.add()){
                //アキ量を設定
                with(borderPanels.add()){
                        with(dialogColumns.add()){
                                staticTexts.add({staticLabel:"前のアキ量"});
                                }
                        with(dialogColumns.add()){
                                var akiBefore=dropdowns.add({stringList: ["ベタ","八分","四分","三分","二分","二分四分","全角","自動"],selectedIndex: 2});
                                }
                        with(dialogColumns.add()){
                                staticTexts.add({staticLabel:"／後のアキ量"});
                                }
                        with(dialogColumns.add()){
                                var akiAfter=dropdowns.add({stringList: ["ベタ","八分","四分","三分","二分","二分四分","全角","自動"],selectedIndex: 2});
                                }
                        }
                with(borderPanels.add()){//check box
                        with(dialogColumns.add()){
                                staticTexts.add({staticLabel: "アキ量を「自動」にする"});
                                }
                        with(dialogColumns.add()){
                                var akiReset = checkboxControls.add({checkedState:false});
                                }
                        }//check box
                }//dialog column
        }//dialog

//dialog の結果を変数に反映
if(dialogObj.show()==true){
        
var akiB, akiA, akiR;
switch(akiBefore.selectedIndex){
        case 0: akiB=0;break;
        case 1: akiB=0.125;break;
        case 2: akiB=0.25;break;
        case 3: akiB=0.33333333333333;break;
        case 4: akiB=0.5;break;
        case 5: akiB=0.75;break;
        case 6: akiB=1;break;
        case 7: akiB=-1;break;//自動
        }
switch(akiAfter.selectedIndex){
        case 0: akiA=0;break;
        case 1: akiA=0.125;break;
        case 2: akiA=0.25;break;
        case 3: akiA=0.33333333333333;break;
        case 4: akiA=0.5;break;
        case 5: akiA=0.75;break;
        case 6: akiA=1;break;
        case 7: akiA=-1;break;//自動
        }
akiR=akiReset.checkedState;//trueかfalseか

akiEnhance(akiB, akiA, akiR);//アキ量を設定Fn
dialogObj.destroy();
}
else{
dialogObj.destroy();
}
}//dialog function
function akiEnhance(akiB, akiA, akiR){

if(akiR==true){
        selObj.leadingAki=-1;
        selObj.trailingAki=-1;
        exit();
        }

if(selObj.lines.length==1){//1行のとき
switch(selWho){
        case "Character":
                selObj.characters[0].leadingAki=akiB;
                selObj.characters[0].trailingAki=akiA;
                break;
        case "Word":
        case "Text":
        case "TextStyleRange":
                selObj.characters[0].leadingAki=akiB;//一文字目前のアキ
                selObj.recompose()//再計算後2行になっていたら複数行処理に移行
                if(selObj.lines.length==2){break;}
                if(selObj.characters[-1].contents.charCodeAt(0).toString()=="13"||//改行
                selObj.characters[-1].contents.charCodeAt(0).toString()=="32"){//欧文スペース
                        selObj.characters[-2].trailingAki=akiA;
                        }
                else{
                        selObj.characters[-1].trailingAki=akiA;
                        }
                break;          
        
        case "Line":
                selObj.characters[0].leadingAki=akiB;//一文字目前のアキ
                selObj.recompose()//再計算後2行になっていたら複数行処理に移行
                if(selObj.lines.length==2){break;}
                if(selObj.lines[0].characters[-1].contents.charCodeAt(0).toString()=="13"||//改行
                selObj.lines[0].characters[-1].contents.charCodeAt(0).toString()=="32"){//欧文スペース
                        selObj.lines[0].characters[-2].trailingAki=akiA;
                        }
                else{
                        selObj.lines[0].characters[-1].trailingAki=akiA;
                        }
                break;          
        case "Paragraph":
                selObj.characters[0].leadingAki=akiB;
                selObj.characters[-2].trailingAki=akiA;
                break;
        }//switch
        }//if line length=1

// $.writeln(app.selection[0].constructor.name);
// $.writeln(selObj.lines.length)

if(selObj.lines.length>=2){//複数行のとき
switch(selWho){
        case "Word":
        case "Text":
        case "TextStyleRange":
        case "Line"://いらないかも
                for(var ln=0; ln<selObj.lines.length; ln++){
                selObj.characters[0].leadingAki=akiB;//1文字目
                selObj.recompose();
                if(ln!=0){
                        selObj.lines[ln].characters[0].leadingAki=akiB;//2行目以降1文字目
                        selObj.recompose();
                        }
                if(ln!=selObj.lines.length-1){//最終行以外の行末
                        if(selObj.lines[ln].characters[-1].contents.charCodeAt(0).toString()=="13"||//改行
                        selObj.lines[ln].characters[-1].contents.charCodeAt(0).toString()=="32"){//欧文スペース
                                selObj.lines[ln].characters[-2].trailingAki=akiA;
                                }
                        else{
                                selObj.lines[ln].characters[-1].trailingAki=akiA;
                                }
                        }
                }
                //最終行の行末
                if(selObj.characters[-1].contents.charCodeAt(0).toString()=="13"||//改行
                selObj.characters[-1].contents.charCodeAt(0).toString()=="32"){//欧文スペース
                        selObj.characters[-2].trailingAki=akiA;
                        }
                else{
                        selObj.characters[-1].trailingAki=akiA;
                        }
                break;
        case "Paragraph":
        case "TextColumn":
                for(var ln=0; ln<selObj.lines.length; ln++){
                        selObj.lines[ln].characters[0].leadingAki=akiB;
                        selObj.recompose();
                        if(selObj.lines[ln].characters[-1].contents.charCodeAt(0).toString()=="13"||//改行
                        selObj.lines[ln].characters[-1].contents.charCodeAt(0).toString()=="32"){//欧文スペース
                                selObj.lines[ln].characters[-2].trailingAki=akiA;
                                }
                        else{
                                selObj.lines[ln].characters[-1].trailingAki=akiA;
                                }
                        }
                break;
        }//switch
        }//if line length 2+
}//aki function
}//if selections

