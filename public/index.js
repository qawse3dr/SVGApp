//global vars
let shapeMenu = "create-rect";
let currentSVG = null;
let currentAttr = null;
let refresh = false;
let loggedIn = false;

let connectionInfo = {host: 'dursley.socs.uoguelph.ca',
  user: "",
  password: "",
  database: ""};
// Put all onload AJAX calls here, and event listeners
$(document).ready(function() {
    $("#loginPopup").modal("show");
    $('#loginPopup').on('hidden.bs.modal', function (e) {
      if(!loggedIn){
        $("#loginPopup").modal("show");
      }
      // do something...
    });
    //gets the SVGImages from server
    getImages();
    $(".navigator").children().click((event) =>{ // changes app view for navigator button
        resetVisibility(".app-view");
        appviewSetView($("."+event.target.name));
        });
    //for new shape or. changes between add rect/circle/path
    $(".shape-buttons-group").children().click((event) =>{ // changes app view for navigator button
        //change the active shape to be added
        shapeMenu = event.target.name;
        //resets and changes the visablility to the new target
        resetVisibility(".create-shape-view");
        appviewSetView($("."+event.target.name));
    });
    //onlick for adding rects
    $(".rect-form").submit((event) => {
        //stops the form from sumbiting
        event.preventDefault();
        //creates a json shape from the data
        let shape = createShape($(".rect-form"));
        if(shape){ //if the shapes values were valid

        }
    });
    //onlick for adding circles
    $(".circle-form").submit((event) => {
        //stops the form from sumbiting
        event.preventDefault();
        //creates a json shape from the data
        let shape = createShape($(".circle-form"));
        if(shape){ //if the shapes values were valid

        }
    });

    //onlick for file uploading
    $("#upload-form").submit((event) => {
      //stops the form from sumbiting
       event.preventDefault();

       //creates form with data
       let form = $("#upload-form")[0];
       let data = new FormData(form);


        //send the file
        $.ajax({
          type:"POST",
          url: '/upload',
          enctype: 'multipart/form-data',
          processData: false,
          contentType: false,
          cache: false,
          data: data,
          success: (data) =>{
              console.log(data);
              alert(data);
              getImages();
              //store file if its is new
              if(data.includes("successfully")){
                storeFilesDB();
              }
          },
          fail: (error) =>{
              alert("error");
              console.log(error);
          }
        });

    });

    $(".scale-img-form").submit((event) => {
        //stops the form from sumbiting
         event.preventDefault();

         if(currentSVG == null || currentSVG == ""){
             alert("Select an SVG First");
             return;
         }
         //creates form with data
         let form =$(".scale-img-form")[0];
         let data = new FormData(form);
         data.append("fileName",currentSVG);


          //send the file
          $.ajax({
            type:"POST",
            url: '/scale',
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            cache: false,
            data: data,
            success: (info) =>{
                console.log(info);
                alert(info);
                getImages();
                getSVGimageData(currentSVG,updateSVGview);
                if(info == "Shapes were scaled")
                  addChangeToDB("Scale image", "Scale type: " + data.get("scaleType") + " for a factor of " + data.get("factor"),currentSVG);
            },
            fail: (error) =>{
                alert("error");
                console.log(error);
            }

      });
    });

    /*creates an svg*/
    $(".create-svg-form").submit((event) => {
      //stops the form from sumbiting
       event.preventDefault();
       //creates form with data
       let form = $(".create-svg-form")[0];
       let data = new FormData(form);


        //send the file
        $.ajax({
          type:"POST",
          url: '/createsvg',
          enctype: 'multipart/form-data',
          data: data,
          processData: false,
          contentType: false,
          cache: false,
          success: (data) =>{
              console.log(data);
              alert(data);
              getImages();
              getSVGimageData(currentSVG,updateSVGview);
              //store file if its is new
              if(data.includes("File Created")){
                storeFilesDB();
              }
          },
          fail: (error) =>{
              alert("error");
              console.log(error);
          }
        });
    });

    /**event for changing the drop down
     *changes table to represents it*/
    $(".image-drop-down").change((event)=>{
      if(event.target.value == ""){//clears the view if no pic is selected
        updateSVGview({fileName:""});
      } else{
        getSVGimageData(event.target.value,updateSVGview);

      }
    });

    $(".attr-dropdown").change((event) =>{
      getAttrData(event.target.value);
    });
    /**event for changing attributes*/
    $(".edit-SVG").submit((event) => {
      event.preventDefault();

      //errorchecking
      if(currentSVG == null || currentSVG == ''){
        alert("Please select an SVG");
        return;
      } else if(currentAttr == null){
        alert("Please select an Attribute");
        return;
      }

      let form = $(".edit-SVG")[0];
      let data = new FormData(form);
      data.append("fileName",currentSVG);

       //send the file
       $.ajax({
         type:"POST",
         url: '/editsvg',
         enctype: 'multipart/form-data',
         data: data,
         processData: false,
         contentType: false,
         cache: false,
         success: (info) =>{

           currentAttr = null;

           console.log(info);
           alert(info);
           getImages();
           getSVGimageData(currentSVG,updateSVGview);
           addChangeToDB("edit attributes", "edit values for " + data.get("comp"),currentSVG);
         },
         fail: (error) =>{
             alert("error");
             console.log(error);
         }
       });
    });


    /**login event**/
    $(".loginForm").submit((event) => {
      event.preventDefault();
      let form = $(".loginForm")[0];
      let data = new FormData(form);

      $.ajax({
        type:"POST",
        url: '/login',
        enctype: 'multipart/form-data',
        data: data,
        processData: false,
        contentType: false,
        cache: false,
        success: (info) =>{

          currentAttr = null;

          console.log(info.string);
          alert(info.string);
          if(!info.error){
            loggedIn = true;
            //save login info
            connectionInfo.user = data.get("username");
            connectionInfo.password = data.get("password");
            connectionInfo.database = data.get("databaseName");


            $("#loginPopup").modal("hide");
          }

        },
        fail: (error) =>{
            alert("error");
            console.log(error);
        }
      });
    });
});

//uses ajax to get and reset the table for attributes
function getAttrData(value){
  $.ajax({
    type: "GET",
    dataType:'json',
    url: "/getattr",
    data: {
        fileName:currentSVG,
        shape:value.split(" ")[0],
        index:Number(value.split(" ")[1])
    },
    success: (data) =>{
      console.log(value + "\'s data was loaded");
      //sets it to null so it doesnt get called in getImages
      currentAttr = value;
      updateAttrDropdown(data);

    },
    fail: (error) =>{
        alert("Data could not be loaded");
        console.log(error);
    }
  });

}
/**updates the attr dropdown based on given obj with format
 *{attr:{"atributes"},otherAttr:[list of atters]}*/
function updateAttrDropdown(data){
  let table = $(".attr-table");
  table.empty();
  let attr = false
  //add manadtory attributes. always comes first
  if(data.attr){ //makes sure that if it doesnt have any it doesnt break
    for(let [key,value] of Object.entries(data.attr)){
      if(key == "numAttr") continue;
      table.append(`<tr>
        <td>${key}</td>
        <td>${value}</td>
        <td><input type="text" name="${key}" value=""></td>
      </tr>`);
      attr = true;
    }
  }
  //add other attributes
  for(let obj of data.otherAttr){
    table.append(`<tr>
      <td>${obj.name}</td>
      <td>${obj.value}</td>
      <td><input type="text" name="${obj.name}" value=""></td>
    </tr>`);
    attr = true;
  }

  if(!attr){
    table.append(`<tr>
      <td>No Attributes</td>
      <td></td>
      <td></td>
    </tr>`);
  }
  //adds panel for new attributes
  table.append(`<tr>
    <td>New Attribute/Edit by name</td>
    <td><input type="text" name="newAttrName" value=""></td>
    <td><input type="text" name="newAttrValue" value=""></td>
  </tr>`);

}
/**gets the images with an ajax call*/
function getImages(){
  refresh = true;
  $.ajax({
    type:"get",
    dataType:'json',
    url: '/getvalidsvg',
    data: {
        fileName:"test",
        size:"test",
        data:{}
    },
    success: (data) =>{
        updateSvgImages(data.SVGimages);

        console.log("Images Loaded");
    },
    fail: (error) =>{

        console.log(error);
    }
  });
}
/**resets all of the panels to not visable*/
function resetVisibility(className){
    $(className).children().css("visibility","hidden");
    $(className).children().css("display","none");

}
/**sets given panel to visable*/
function appviewSetView(panel){

    panel.css("visibility","visible");
    panel.css("display","block");
}


/**updates the table and dropdown given an array of svgImages*/
function updateSvgImages(SVGimages){
  //clears the table to start with a fresh table
  clearTable();
  //clears the dropdown
  clearDropdown();

  //sets the new elements
  setTable(SVGimages);
  setDropdown(SVGimages);


}

//clears table in the SVG view panel
function clearTable(){
  //clear the list
  $("#SVGimages").empty()
}

//clears the dropdown in the svgView panel
function clearDropdown(){
  $(".image-drop-down").empty();
}

//sets the table based on an array of svgImages
function setTable(SVGimages){
  clearTable();
  if(SVGimages.length > 0){
    let count = 0;
    for(const image of SVGimages){

      let string =
          `<tr>
            <td><img class="image-thumbnail" src="/${image.fileName}#${new Date().getTime()}"></td>
            <td><a onclick="downloadImage(event)" href="/${image.fileName}" download>${image.fileName}</a></td>
            <td>${Math.round(image.size)} KB</td>
            <td>${image.numRect}</td>
            <td>${image.numCirc}</td>
            <td>${image.numPaths}</td>
            <td>${image.numGroups}</td>
            </tr>`;
      $("#SVGimages").append(string);

      count++;
    }
    if(count > 5){
      $(".file-log").css("overflow-y","scroll");
    } else{
      $(".file-log").css("overflow-y","auto");
    }

  } else{ //set empty table with noFiles warning
    $("#SVGimages").append(`<tr>
       <td>No files</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>`);
  }
}

//sets the dropdown based on an arrray of SVGImages
function setDropdown(SVGimages){
  if(refresh == false){
    $("#svg-view-image").attr("src","");
  }
  $(".image-drop-down").append(`<option value="">select an image</option>`);
  for(const images of SVGimages){
    $(".image-drop-down").append(`<option value="${images.fileName}">${images.fileName}</option>`);
  }
  if(currentSVG != null && currentSVG != ''){
    $(".image-drop-down")[0].value = currentSVG;
  }

  refresh = false;

}

/**Takes in a fileName then makes an ajax
 *call to give info and displays it on the table*/
function updateSVGview(SVGimageData){
  //clears SVGview
  clearSVGview();
  //clears the dropdown in addAttribute
  $(".attr-dropdown").empty();
  $(".attr-table").empty();
  //adds empty chart
  $(".attr-table").append(`<tr><td>No Attibutes</td><td></td><td></td></tr>`);
  //checks if its the default value of the dropdown
  if(SVGimageData.fileName == "" && refresh == false){
      $("#svg-view-image").attr("src","");

      $(".attr-dropdown").append(`<option value="">Select Element</option>`);

      return;
  }
  //sets title and description
  $("#title").text(SVGimageData.title);
  $("#desc").text(SVGimageData.desc);
  //set image
  $("#svg-view-image").attr("src","/"+SVGimageData.fileName+'#'+ new Date().getTime());
  $(".attr-dropdown").append(`<option value="">Select Element</option>`);
  $(".attr-dropdown").append(`<option value="SVG 1">SVG 1</option>`);

  //sets the current image
  if(!refresh){
    currentSVG = SVGimageData.fileName;
  }

  //add rects
  let counter = 1;
  for(const comp of SVGimageData.rects){
          /*************For table in SVGVIEW******************/
    $("#svg-components").append(`
      <tr>
        <td>Rectangle ${counter}</td>
        <td>${rectToSum(comp)}</td>
        <td>${comp.numAttr}</td>
      </tr>
      `);
    /*****************For attribute dropdown****************/
    $(".attr-dropdown").append(`<option value="Rectangle ${counter}">Rectangle ${counter}</option>`);
    counter++;
  }
  //add circles
  counter = 1;
  for(const comp of SVGimageData.circles){
          /*************For table in SVGVIEW******************/
    $("#svg-components").append(`
      <tr>
        <td>Circle ${counter}</td>
        <td>${circleToSum(comp)}</td>
        <td>${comp.numAttr}</td>
      </tr>
      `);
    /*****************For attribute dropdown****************/
    $(".attr-dropdown").append(`<option value="Circle ${counter}">Circle ${counter}</option>`);

    counter++;
  }
  //add paths
  counter = 1;
  for(const comp of SVGimageData.paths){
          /*************For table in SVGVIEW******************/
    $("#svg-components").append(`
      <tr>
        <td>Path ${counter}</td>
        <td>${pathToSum(comp)}</td>
        <td>${comp.numAttr}</td>
      </tr>
      `);
    /*****************For attribute dropdown****************/
    $(".attr-dropdown").append(`<option value="Path ${counter}">Path ${counter}</option>`);

    counter++;
  }
  //add groups
  counter = 1;
  for(const comp of SVGimageData.groups){
    /*************For table in SVGVIEW******************/
    $("#svg-components").append(`
      <tr>
        <td>Group ${counter}</td>
        <td>${groupToSum(comp)}</td>
        <td>${comp.numAttr}</td>
      </tr>
      `);

    /*****************For attribute dropdown****************/
    $(".attr-dropdown").append(`<option value="Group ${counter}">Group ${counter}</option>`);

    counter++;
  }
  if(currentSVG != null && currentSVG != ""){
    $(".image-drop-down")[0].value = currentSVG;
  }
}
//converts a rectangle
function rectToSum(rect){
  return `Upper left corner: x=${rect.x+rect.units}, y=${rect.y+rect.units}
    Width:${rect.w+rect.units}, Height:${rect.h+rect.units}`;
}
//converts a circle
function circleToSum(circle){
  return `Centre: x=${circle.cx+circle.units}, y=${circle.cy+circle.units}
    radius=${circle.r+circle.units}`;
}
//converts a path
function pathToSum(path){
  return `Path Data: ${path.d}`
}
//converts a group
function groupToSum(group){
  return `${group.children} child element(s)`;
}
//clears the svgview table
function clearSVGview(){
  $("#title").text("");
  $("#desc").text("");
  $("#svg-view-image").attr("src","");
  $("#svg-components").empty();
}

/**gets a svgimage from server and calls a functions
on arrival doesnt call returnFun if it fails for any reason*/
function getSVGimageData(fileName,returnFun){
  $.ajax({
    type:"get",
    dataType:'json',
    url: '/getimagedata',
    data: {
        fileName:fileName,
    },
    success: (data) =>{
        returnFun(data);
        console.log(fileName + " Image data received");
    },
    fail: (error) =>{

        console.log(error);
    }
  });
}

/**Creates the a shape from the form*/
function createShape(form){
    //data retrived from form
    let data = form.serializeArray();

    //makes sure there is a SVG selected*/
    if(!currentSVG){ //print error and do nothing further
        alert("Please select a SVG first");
        return;
    }
    let shape = null;
    let shapeType = 1; //currently a rect
    if(form.attr("action") === "/addRect"){  //create a rect
        //basic rect
        shape = {x:0,y:0,w:0,h:0,units:""};

        //gets value from form
        shape.x = data[0].value;
        shape.w = data[1].value;
        shape.units = data[2].value;
        shape.y = data[3].value;
        shape.h = data[4].value;

        //validateInput
        if(!$.isNumeric(shape.x) || !$.isNumeric(shape.y) ||
            !$.isNumeric(shape.w) || !$.isNumeric(shape.h)){
            shape = null;
        }
        if(shape != null){
          shape.x = Number(shape.x);
          shape.y = Number(shape.y);
          shape.w = Number(shape.w);
          shape.h = Number(shape.h);
        }
    }else{ //circle
        shapeType = 0;
        shape = {cx:0,cy:0,r:0,units:""};
        //gets value from inputs
        shape.cx = data[0].value;
        shape.cy = data[2].value;
        shape.r = data[1].value;
        shape.units = data[3].value;

        //validateInput
        if(!$.isNumeric(shape.cx) || !$.isNumeric(shape.cy) ||
            !$.isNumeric(shape.r)){
            shape = null;
        }
        if(shape != null){
          shape.cx = Number(shape.cx);
          shape.cy = Number(shape.cy);
          shape.r = Number(shape.r);
        }
    }
    if(!shape ){
        alert("The shape is not valid");
    } else{ //valid shape
        //ajax call to send shape to the server
        sendShape(shape,form);

    }
}

function sendShape(shape,form){
    let url = null;
    $.ajax({
      type: "GET",
      dataType:'json',
      url: form.attr("action"),
      data: {
          fileName:currentSVG,
          shape:JSON.stringify(shape)
      },
      success: (data) =>{
          if(data.errorCode == 0){
              alert("The shape could not be added to the image");
              console.log("Shape was not added");
          }else{
              getImages();
              getSVGimageData(currentSVG,updateSVGview);
              if(currentAttr){
                getAttrData(currentAttr);
              }
              //adding info to change database
              if(form.attr("action") == "/addRect"){
                addChangeToDB("Add Shape","Rectangle added",currentSVG);
              } else{
                addChangeToDB("Add Shape","Circle added",currentSVG);
              }
              console.log("Shape Added");
              alert("Shape was added to the img");
          }
      },
      fail: (error) =>{
          alert("The shape could not be added to the image");
          console.log(error);
      }
  });
}



/****A4 functions***/

//displays an alert based on how many events have happened
function displayDBStatus(){
  //do ajax call to get info
  $.ajax({
    type:"get",
    dataType:'json',
    url: '/DBStatus',
    data: {
        connectionInfo: connectionInfo,
    },
    success: (data) =>{
        console.log(data);
        alert(`Database has ${data.numFiles} files, ${data.numChanges} changes, and ${data.numDownloads} downloads.`);
    },
    fail: (error) =>{

        console.log(error);
    }
  });
}

function storeFilesDB(){
  //ajax to store files
  $.ajax({
    type:"get",
    dataType:'json',
    url: '/addFilesDB',
    data: {
        connectionInfo: connectionInfo,
    },
    success: (data) =>{
        console.log(data);
        alert("Files were added to the DB");
    },
    fail: (error) =>{

        console.log(error);
    }
  });
}

function delFilesDB(){

  $.ajax({
    type:"get",
    dataType:'json',
    url: '/deleteFilesDB',
    data: {
        connectionInfo: connectionInfo,
    },
    success: (data) =>{
        console.log(data);
        alert("DB was cleared")
    },
    fail: (error) =>{

        console.log(error);
    }
  });
}

function downloadImage(event){
  console.log(event.target.innerHTML);
  //stores download info
  $.ajax({
    type:"get",
    dataType:'json',
    url: '/addDownloadDB',
    data: {
        connectionInfo: connectionInfo,
        name: event.target.innerHTML,
    },
    success: (data) =>{
        console.log(data);
        alert("download info was added to the DB");
    },
    fail: (error) =>{

        console.log(error);
    }
  });
}

function addChangeToDB(change_type, change_summary,fileName){
  $.ajax({
    type:"get",
    dataType:'json',
    url: '/addChangeToDB',
    data: {
        connectionInfo: connectionInfo,
        change_type: change_type,
        change_summary: change_summary,
        fileName:fileName
    },
    success: (data) =>{
        console.log(data);
        alert("download info was added to the DB");
    },
    fail: (error) =>{

        console.log(error);
    }
  });
}
