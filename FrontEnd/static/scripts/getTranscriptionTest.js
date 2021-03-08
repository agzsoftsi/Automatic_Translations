/**  
  * JAVASCRIPT CODE
  * -------------------------------------------------------------------------------------------------------------------------------
  * @file: getTranscription.js
  * @file: Functions to the get and display the transcription translated to language selected
  * @version : 3.1
  * @author : Carlos Andres Garcia Morales<agzsoftsi@gmail.com>.
  * @supported : Google Chrome, Mozilla Firefox, Microsoft Edge, Opera, Maxthon.
  * @history : 
  *           1.0 - API access using fetch to get the Text file with the transcription Translated by Default in English.
  *               - Tested.
  *           1.1 - API access using fetch to get the JSON file with the transcription Translated by Default in English, 
  *               - Add Language selector, it returns a string as parameter ['en','es', ...].
  *               - Add function to Load the API Access.
  *               - Add process to display the transcription translated on HTML.
  *               - Tested.
  *           1.2 - API access using fetch to get the JSON file with the transcription Translated by Default in English
  *               - Change Complete API endpoint with Variables to manage the parameters, and for the future Changes.
  *               - Tested.
  *           2.0 - Add video tracker on every subtitle of the transcription.
  *               - Tested.
  *           3.0 - Add Optional Feature: new function to change the text 'Transcription' to the language Seleted
  *                 and add a flag for each type of language - for the future process the the function change to 
  *                 manage the flag and transcriptions from all languages.
  *                 Languages supported: en, es, fr, pt, de, hi, ru, ar, ru, ja.
  *               - Tested.
  *           3.1 - Add Optional Feature: new function to change the presentation of the Transcription to Subtitles or Paragraphs.
  *               - Testing: paragraph
  *           3.2 - Add Optional Feature: Playlist is linked to the transcriptions.
  *           3.3 - Add Optional Feature: Close Caption(subtitles) are working for each video.
  *---------------------------------------------------------------------------------------------------------------------------------                              
*/



/** 
  * @function loadTranscription: Function Load the transcription translated on the Web page, it Allows change the language 
  *                              using the Select and request the transcription translated to Lambda Function in AWS
  * @param {Number} nVideo: is the number of the video to process
  * @return {string} output: Returns the Time and Transcription Translated
*/
function loadTranscription(nVideo)
{
    /**
      * INIT VARIABLES:
      * @member {Object} select: HTML Element - Is the language select in HTML
      * @member {string} lang:  Is the value of the selected option (en, es, pt, etc)
      * @member {Object} select1:  HTML Element - Is the presentation of transcription select in HTML
      * @member {string} transtype:  Is the value of the selected option (sub = subtitles, par = paragraph)
      * @member {string} sourceTrans: Provisional video name, is one of arguments to request in the API
      * @member {string} catchNumVideo: HTML Element - Is the num of tthe video
      * @member {string} sourceTrans: Provisional video name, is one of arguments to request in the API
      *  
      * Testing: console.log(transtype);
      * Testing: console.log(typeof(transtype));
    */
    let select = document.getElementById('target');
    let lang = select.value;
    let select1 = document.getElementById('transpresent');
    let transtype = select1.value;

    var catchNumVideo = document.querySelector("#vid > source").src.slice(78,80);
    //console.log(catchNumVideo);
    
    if (nVideo == undefined)
    {
      var onlyNum = catchNumVideo.slice(1,2);
      if(onlyNum != '.'){
        nVideo=catchNumVideo; 
      }
      else{
        nVideo=catchNumVideo.slice(0,1);
      }
    }

    let sourceTrans = "video"+nVideo+"t.srt";

    //console.log(sourceTrans);

    
    /**
      *  @function Changelanguage: Function Invoked - This function is an Optional feature to change the text
      *                            and the flag depending of the lang value
      *  @param {string} lang: Is the value of the selected option (en, es, pt, etc)
    */
    Changelanguage(lang);

    /**
     *   VARIABLE: -----IMPORTANT------
     *   @const {string} API: - API endpoint
     *   @param {string} lang: Is the value of the selected option (en, es, pt, etc)
     *   @member {string} sourceTrans: Provisional video name, is one of arguments to request in the API
     *   Struture: "https://ytuln8zsz1.execute-api.us-east-1.amazonaws.com/" - URL API
     *   Struture: "translatetext" - Lambda Function where is processed
     *   Struture: "?TargetLang="+lang+" - First Paramenter, the Language to Request, lang = [en,es,fr,etc...]
     *   Struture: "&Bucket=transcriptions-translations" - Second parameter, the S3 bucket where is the Transcription
     *   Struture: "&Bucketkey=formats/"+sourceTrans" - Third parameter, Bucketkey is the file(transcription) to process, 
     *              sourceTrans is name of the file [video1t.srt]
     *   
     *   NOTE: we are using two API endpoints:
     *   1-Production: 
     *   const API = "https://ytuln8zsz1.execute-api.us-east-1.amazonaws.com/translatetext?TargetLang="+lang+"&Bucket=transcriptions-translations&Bucketkey=formats/"+sourceTrans;
     *   
     *   2-Development and Testing:
     *   const API = "https://rlv4ft76fg.execute-api.us-east-1.amazonaws.com/translatefunction_dev/?TargetLang="+lang+"&Bucket=transcriptions-translations&Bucketkey=formats/"+sourceTrans;
     * 
     *   Update 2 in API
     *   1-Production: 
     *   const API = "https://ytuln8zsz1.execute-api.us-east-1.amazonaws.com/translatetext?TargetLang="+lang+"&Bucketkey=formats/"+sourceTrans;
     * 
     *   2-Development and Testing:
     *   const API = "https://rlv4ft76fg.execute-api.us-east-1.amazonaws.com/translatefunction_dev/?TargetLang="+lang+"&Bucketkey=formats/"+sourceTrans;
    */
    
    const API = "https://ytuln8zsz1.execute-api.us-east-1.amazonaws.com/translatetext?TargetLang="+lang+"&&Bucketkey=formats/"+sourceTrans;
    
    /**
      *  REQUEST AND RESPONSE USING API
      *  VARIABLES:
      *  API: String - API endpoint
      *  @class
      *  @member {object} response:is the Transcription Translated in JSON format
      *  @member {object} transcription:using this variable for several Futures implementations
      *
      *  SOME future Parameters with Some Headers
      *       fetch(API, {mode: 'no-cors', 'headers': {
      *      'Access-Control-Allow-Origin': '*',
      *      'Access-Control-Allow-Credentials' : true }
      *      })
      *
      *  ANOTHER WAY TO DISPLAY THE RESPONSE ON HTML WHEN THE RESPONSE IS TEXT, NOT JSON
      *      const regexp1=/<br>/gi;
      *      const regexp2=/<st>/gi;
      *      const regexp3=/<tx>/gi;
      *      const regexp4=/<id>/gi;
      *      const transcription1=transcription.replace(regexp1, '');
      *      const transcription2=transcription1.replace(regexp2, '&nbsp;');
      *      const transcription3=transcription2.replace(regexp3, '&nbsp;');
      *      const transcription4=transcription3.replace(regexp4, '<br>');
      *      console.log(transcription4);
      *      console.log(transcription);
      *      document.getElementById("data").innerHTML=JSON.stringify(transcription[0].start +"&nbsp;&nbsp;&nbsp;&nbsp;"+ transcription[0].content);
      * 
      *
      *  Testing: command: debugger
      *  Testing: console.log(transcription);
    */
    
    fetch(API).then((response) => {
        return response.json()
    
    }).then((response) => {
        //debugger
        var transcription=response;
        
    
    /**
      *  DISPLAY THE TRANSCRIPTION TRANSLATED ON HTML
      *  VARIABLES:
      *  @member {string} output: Contain the result of the JSON with the Transcription [times and Texts]
      *  @member {string} outputTime: Is only to store the time when the presentarion is 'par' = PARAGRAPH
      *  @member {string} outputTime1: Is only to store the time when the presentarion is 'par' = PARAGRAPH but in collection
      *  @member {number} i: iterator value for start the loop and give the index to each transcriptions on JSON
      *  @member {number} h: the hours of the transcripcion [hh:xx:xx] - I Use substr to take only the houre
      *  @member {number} m: the minutes of the transcripcion [xx:mm:xx] - I Use substr to take only the minutes
      *  @member {number} s: the seconds of the transcripcion [xx:xx:ss] - I Use substr to take only the seconds
      *  @member {number} timeTS: time converted to Seconds
      *  @member {string} transtype: Is the value of the selected option (sub = subtitles, par = paragraph)
      *  @member {string} transParagraph: Store all subtittles in a group of time
      * @member {object} arrayTimes: Store all times for the function currentTime()
      * 
      * ANOTHER WAY TO DISPLAY THE RESPONSE ON HTML WHEN THE RESPONSE IS TEXT, NOT JSON
      *      const regetime=/-->/gi;
      *      document.getElementById("data").innerHTML="<br>"+transcription[i].start +"&nbsp;&nbsp;&nbsp;&nbsp;"+transcription[i].content+"<br>";
      *      console.log(transcription[i].start +"   "+transcription[i].content);
      *      output += "<br>" + transcription[i].start+"&nbsp;&nbsp;&nbsp;&nbsp;<tx class='subt' onclick='Currentime("+i*10+");'>"+transcription[i].content+"</tx>";
      *      output += "<br>" + transcription[i].start.replace(regetime, ' - ') +"&nbsp;&nbsp;&nbsp;&nbsp;<tx class='subt' onclick='Currentime("+i*10+");'>"+transcription[i].content+"</tx>";
      *      output += "<br>" + transcription[i].start.slice(0,8) +"&nbsp;&nbsp;&nbsp;&nbsp;<tx class='subt' onclick='Currentime("+i*10+");'>"+transcription[i].content+"</tx>";
      *
      *
      *  Testing: console.log(h);
      *  Testing: console.log(m);
      *  Testing: console.log(typeof(s));
      *  Testing: console.log(timeTs);
      *  Testing: console.log(transcription[i].start.slice(0,8));
    */    
       

      

        var output = '';
        //var output2 = '';
        var outputTime = '';
        var outputTime1 = '';
        var j=0;
        var k=0;
        var transParagraph = '';
        var arrayTimes=[];
                
        for(var i=0; i < transcription.length; i++){
        
            /**
              * Time Converted to Seconds
              * @function substr: return the specific string of the time
              * @function parseInt: parse string to integer
              * @function slice: return the specific part of the string
              */
            var h = parseInt(transcription[i].start.substr(0,1));
            var m = parseInt(transcription[i].start.substr(3,4));
            var s = parseInt(transcription[i].start.substr(6,8));
            var timeTs = (h*3600)+(m*60)+s;
            arrayTimes.push(timeTs);


              

            /**
              * Process the Transciption with presentation in subtitles is by default
              */
            if(transtype=="sub")
            {
                        output += "<tr><td><strong class='textTime'>" + transcription[i].start.slice(0,8) +"</strong></td><td><tx class='subt' onclick='Currentime("+timeTs+");' id='t"+timeTs+"'>"+transcription[i].content+"</tx></td></tr>";
            }

            /**
              * Process the Transciption with presentation in paragraph OPTIONAL FEATURE
              */
            if(transtype=="par")
            {
                    if(i%5==0)
                        {
                            
                            outputTime = transcription[i].start.slice(0,8);
                                                        
                        }
                        transParagraph +=  "<tx class='subt' onclick='Currentime("+timeTs+");' id='t"+timeTs+"'>"+transcription[i].content+"</tx> &nbsp;";
                        //console.log(outputTime);
                        //output += "<tr><td><strong class='text-warning'>" + outputTime +"</strong></td><td><tx class='subt' onclick='Currentime("+timeTs+");'>"+transcription[i].content+"</tx></td></tr>"; 
                        
                        if(i%5==0  && i!=0)
                        {
                          
                        outputTime1 = transcription[j].start.slice(0,8);
                             
                       
                        output += "<tr><td><strong class='textTime'>" + outputTime1+" - "+outputTime +"</strong></td><tr><td>"+transParagraph+"</td></tr>";
                        
                        
                        transParagraph='';

                        j=j+5;
                        
                        
                        }
                        
            }

        


        }

        /**
          * Display the Transciption on HTML
          * @inner
          */

        document.getElementById("data").innerHTML="<table cellpadding='10'>"+output+"</table>";
       
        //console.log(typeof(arrayTimes));
        //console.log(arrayTimes);
        followVideo(arrayTimes);
        
           
    })




}



/**
  *  DISPLAY THE FLAG AND TEXT OF LANUAGE SELECTED - OPTIONAL FEATURE
  *  @function Changelanguage - This function is an Optional feature to change the text
  *                              and the flag depending on lg
  *                                     
  *  VARIABLES:
  *  @param {string} lg = es the language selected on html - lg=lang - [en, es, etc...]
  *  NOTE: LANGUAGES ADDED [en,es,fr,pt,de,hi,ar,jp,ru] - For otherrr Updaates the process will need to be optimized
  *
  *  Testing: console.log(lg == 'en');
  *  Testing: console.log(lg);
  *  Testing: console.log(typeof(lg));
  *  @inner
  */   
 

function Changelanguage(lg){

    // 
    if(lg == 'en')
    {
        document.getElementById('language').innerHTML="Translate";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagEN.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="Format";
    }
    if(lg == 'fr')
    {
        document.getElementById('language').innerHTML="Traduire";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagFR.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="Format";
    }
    if(lg == 'es')
    {
        document.getElementById('language').innerHTML="Traducir";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagES.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="Formato";
    }
    if(lg == 'hi')
    {
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagHI.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('language').innerHTML="अनुवाद करना";
        document.getElementById('transcPresentation').innerHTML="स्वरूप";
    }
    if(lg == 'pt')
    {
        document.getElementById('language').innerHTML="Traduzir";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagPT.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="Formato";
    }
    if(lg == 'de')
    {
        document.getElementById('language').innerHTML="Übersetzen";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagDE.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="Format";
    }
    if(lg == 'ar')
    {
        document.getElementById('language').innerHTML="ترجمة";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagAR.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="شكل";
    }
    if(lg == 'ru')
    {
        document.getElementById('language').innerHTML="Перевести";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagRU.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="Формат";
    }
    if(lg == 'ja')
    {
        document.getElementById('language').innerHTML="翻訳する";
        document.getElementById('flaglang').innerHTML="<img src='static/media/flagJP.png' class='flaground img-fluid' alt='Responsive image'>";
        document.getElementById('transcPresentation').innerHTML="フォーマット";

    }
    
    

}




/**
  * INIT - EVENT
  * @event: window.onload
  * @class
  * @function loadTranscription
  * This is the frist event loaded when Page is Opened, its Invoke the Function  loadTranscription 
  * that request the transcription translated the first time by default in English
  * @param {number} numerber by defualt represents video number
  */   
window.onload=function(){
    loadTranscription(1);
    //followVideo();
  
}


/**
 *       GET THE CURRENT TIME OF THE VIDEO TO MANAGE THE TRACK
 *       Function: Currentime(n) - This function is necessary to access to specific track of the video, 
 *                                 specific time of each text in transcription when the user press click on
 *       
 *       VARIABLES:
 *       @param {number} n:time in Seconds - [n = timeTs]
 *
 *       Testing: console.log(n);
 */  
function Currentime(n){

   document.getElementById('vid').currentTime = n;

}


/**
 *       FOLLOWS THE TRACK FOR EACH VIDEO TIME AUTOMATICALLY
 *       Function: followVideo(arrayTimes) - This function is necessary to display the track of tthe video simultaniusly with subtitle
 *       
 *       @param {object} arrayTimes: array of video times
 *
 *       
 */  
function followVideo(arrayTimes){
  
  /**
 *       VARIABLES
 *       Function: followVideo(arrayTimes) - This function is necessary to display the track of tthe video simultaniusly with subtitle
 *       
 *       VARIABLES:
 *       @member {number} timeVideo: stores current time of tthe video
 *       @member {number} i: Used as an iterator
 *         
 */  
  
  var timeVideo = 0;
  var i=0;

  var videoElement = document.getElementById('vid');
  videoElement.addEventListener("timeupdate",function(ev){

   
    timeVideo = parseInt(videoElement.currentTime);
    
 if (typeof arrayTimes !== 'undefined') {
    // Ahora sabemos que foo está definido, ahora podemos continuar.
    for(i=0; i<arrayTimes.length; i++){
      if(timeVideo==arrayTimes[i])
        {
          
         
          document.getElementById('t'+arrayTimes[i]).classList.add('subtFollow');
       
                   
        }
        
        else
        {
            //if (typeof document.getElementById('t'+arrayTimes[i]).classList.remove('subtFollow') !== void 0) {
            // Ahora sabemos que foo está definido, ahora podemos continuar.
            document.getElementById('t'+arrayTimes[i]).classList.remove('subtFollow');
            
          //  console.log(document.getElementById('t'+arrayTimes[i]).classList.remove('subtFollow'));
          //}
         
          
        }
  
    }
  }
    
  },true);

  

 
}




/**
 *       Function:watchVideo(nVideo) - GET THE VIDEO Subtitles and Transcription selector
 *       @param {number} nVideo:the number of the video to play
 *
 *       
 */ 

function watchVideo(nVideo){

  /**
    *       Function:loadTranscription(nVideo) - Invoke function to return the transcription to specific video
    *       @param {number} nVideo:the number of the video to play
    *       
    *       VARIABLES
    *       @member {object} newVideo: stores the video element <source>
    *       @member {number} i: Used as an iterator
    *       @member {number} timeVideo: stores current time of tthe video
    */ 
  loadTranscription(nVideo);
  

  //console.log(nVideo);
  var newVideo = document.querySelector("#vid > source"); 
  //console.log(newVideo);
  newVideo.src="static/media/videos/video"+nVideo+".mp4";
  //console.log(newVideo);
  

  var i = 1;

  for(i=1; i<14; i++){

    if(i==nVideo){
      document.getElementById('lvideo'+nVideo).classList.add('videoItemActive');
    }
    else{
      document.getElementById('lvideo'+i).classList.remove('videoItemActive');
    }

    
  }

  /**
   * Optional - Display the name of the section on Video Top
   * 
   * VARIABLES
   * @member {object} subtTracks1: stores the video element <source> when the subtitle is english
   * @member {object} subtTracks2: stores the video element <source> when the subtitle is spanish
   * @member {object} subtTracks3: stores the video element <source> when the subtitle is french
   * 
   */

  var subtTracks1 = document.getElementById("vids1");
  var subtTracks2 = document.getElementById("vids2");
  var subtTracks3 = document.getElementById("vids3");
 
  
  
  if(nVideo==1){
    document.getElementById("titleVideo").innerText="1. Introduction";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video1S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video1S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video1S_fr.vtt";

  }
  if(nVideo==2){
    document.getElementById("titleVideo").innerText="2. What is Isometric Illustration?";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video2S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video2S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video2S_fr.vtt";

  }
  if(nVideo==3){
    document.getElementById("titleVideo").innerText="3. Planning & Sketching";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video3S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video3S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video3S_fr.vtt";
  }
  if(nVideo==4){
    document.getElementById("titleVideo").innerText="4. Determining Your Light Source";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video4S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video4S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video4S_fr.vtt";
  }
  if(nVideo==5){
    document.getElementById("titleVideo").innerText="5. Creating Your Grid";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video5S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video5S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video5S_fr.vtt";
  }
  if(nVideo==6){
    document.getElementById("titleVideo").innerText="6. Choosing Style & Color";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video6S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video6S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video6S_fr.vtt";
  }
  if(nVideo==7){
    document.getElementById("titleVideo").innerText="7. Customizing Isometric Cubes";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video7S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video7S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video7S_fr.vtt";
  }
  if(nVideo==8){
    document.getElementById("titleVideo").innerText="8. Tools: 3D Rotate, Reflect, & Blend";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video8S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video8S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video8S_fr.vtt";
  }
  if(nVideo==9){
    document.getElementById("titleVideo").innerText="9. Tools: 3D Extrude";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video9S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video9S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video9S_fr.vtt";
  }
  if(nVideo==10){
    document.getElementById("titleVideo").innerText="10. Tools: 3D Extrude";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video10S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video10S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video10S_fr.vtt";
  }
  if(nVideo==11){
    document.getElementById("titleVideo").innerText="11. Putting It All Together";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video11S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video11S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video11S_fr.vtt";
  }
  if(nVideo==12){
    document.getElementById("titleVideo").innerText="12. Final Thoughts";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video12S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video12S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video12S_fr.vtt";
  }
  if(nVideo==13){
    document.getElementById("titleVideo").innerText="13. Learn More with DKNG";
    subtTracks1.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video13S_en.vtt";
    subtTracks2.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video13S_es.vtt";
    subtTracks3.src="https://transcriptions-translations.s3.amazonaws.com/static/media/subtitles/video13S_fr.vtt";
  }
  //console.log(subtTracks1);
  //console.log(subtTracks2);
  //console.log(subtTracks3);

  document.getElementById("vid").load();


 
}