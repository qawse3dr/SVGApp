'use strict'

// C library API
const ffi = require('ffi-napi');

// Express App (Routes)
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');

//sql
const mysql = require("mysql2/promise");

app.use(fileUpload());
app.use(express.static(path.join(__dirname+'/uploads')));

// Minimization
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Send HTML at root, do not change
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Send Style, do not change
app.get('/style.css',function(req,res){
  //Feel free to change the contents of style.css to prettify your Web app
  res.sendFile(path.join(__dirname+'/public/style.css'));
});

// Send obfuscated JS, do not change
app.get('/index.js',function(req,res){
  fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', function(req, res) {
  if(!req.files || !req.files.uploadFile ) {
    return res.status(400).send('No files were uploaded.');
  }
  let uploadFile = req.files.uploadFile;
  //checks if file exits

  if (fs.existsSync("uploads/"+uploadFile.name)) {
    console.error("File already exists")
    return res.send(uploadFile.name + ' already exists');
  }
  if(!uploadFile.name.endsWith(".svg")){
    console.log("invlaid file format");
    return res.send('The file is not an svg');
  }

  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv('uploads/' + uploadFile.name, function(err) {
    if(err) {
      return res.send(err);
    }
  return res.send(uploadFile.name + ' uploaded successfully');
    //res.redirect('/');
  });
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function(req , res){
  fs.stat('uploads/' + req.params.name, function(err, stat) {
    if(err == null) {
      res.sendFile(path.join(__dirname+'/uploads/' + req.params.name));
    } else {
      console.log('Error in file downloading route: '+err);
      res.send('');
    }
  });
});

//******************** Your code goes here ********************

//creating the shared lib to interface with
var svgParser = ffi.Library("libsvgparse",{
  "getValidSVGimage": ["string",["char*"]],
  "setAttributeToFile": ["int",["char*","int","int","char*","char*"]],
  "addComponentToFile": ["int",["char*","int","char*"]],
  "saveSVGtoFile":["int",["char*","char*"]],
  "getComponents":["string",["char*"]],
  "getAttributesFromFile":["string",["char*","int","int"]],
  "scaleShapes":["int",["char*","int","float"]]

});

//sends valid svg docs
app.get("/getvalidsvg", (req,res) => {

    fs.readdir(path.join(__dirname,"uploads"), (err,files) =>{
        let svg = {SVGimages:[]};
        if(err){
          console.log("Failed to read files");
        }
        for(const file of files){
          if(!file.endsWith("svg")){
            console.log(file + " is not an svg");
            continue; //ignores none svg files
          }
          let fileBuffer = Buffer.alloc(("./uploads/"+file).length+1);
          fileBuffer.write("./uploads/"+file);
          let imgStr = svgParser.getValidSVGimage(fileBuffer);
          if(imgStr != null){
            let img;
            try{
              img = JSON.parse(imgStr.toString("utf-8").replace(/\n/g," "));
            } catch(err){
              console.log("failed to parse JSON for " + file);
              continue;
            }
            img.fileName = file;
            img.size = sizeOfFile(file)
            svg.SVGimages.push(img);
          } else {
            console.log(file + " is not valid or could not be read");
          }
        }
          console.log("files were retrived");
          res.send(svg);
    });
    //sample svg is {fileName: "name",size:1kb,data:{rect,circle,path,groups}}

});

//GETS all the atter info needed to desplay about the compenent
app.get("/getattr",(req,res) => {
  //creates the file buffer
  let fileBuffer = Buffer.alloc(("./uploads/"+req.query.fileName).length+1);
  fileBuffer.write("./uploads/"+req.query.fileName);
  //finds the elemtype with respect to the enem in c
  let shape = req.query.shape;
  switch(shape){
    case "SVG":
      shape = 0
      break;
    case "Circle":
      shape = 1;
      break;
    case "Rectangle":
      shape = 2;
      break;
    case "Path":
      shape = 3;
      break;
    case "Group":
      shape = 4;
      break;
    default:
      console.log("This shouldnt happen");
      break;
  }
  let index = Number(req.query.index) -1;
  let value;
  try{

    value = JSON.parse(svgParser.getAttributesFromFile(fileBuffer,shape,index))
    console.log("attr sent")
    return res.send(value);
  } catch(error){
    console.log("JSON could not be parsed");
    return res.send("Could not parse attributes");
  }
});
//creates an svg image
app.post("/createsvg", (req,res) => {
  if (fs.existsSync("uploads/"+req.body.fileName)) {
    console.error("File already exists")
    return res.send(req.body.fileName + ' already exists');
  } else if(req.body.title.length>255 || req.body.desc.length>255){
    console.error("title or description is too long")
    return res.send("title or description is too long");
  } else if(!req.body.fileName.endsWith(".svg")){
    console.error("Not an svg file")
    return res.send("Not an svg file");
  }

  let SVGdata = {title:req.body.title,descr:req.body.desc};
  let fileName = Buffer.alloc(("uploads/"+req.body.fileName).length + 1);
  //test JSON
  let data;
  try{
    data = JSON.stringify(SVGdata);
  }catch(error){
    console.log("JSON failed to stringify");
    return res.send("Data could not be parsed");
  }
  let dataBuffer = Buffer.alloc(data.length + 1);
  fileName.write("uploads/"+req.body.fileName);
  dataBuffer.write(data);
  let errorCode = svgParser.saveSVGtoFile(fileName,dataBuffer);

  if(errorCode){
    console.log("file Created")
    return res.send("File Created");
  }else{
    console.log("invalid file");
    return res.send("File Invalid");
  }

});

//edits SVG
app.post("/editsvg", (req,res) => {
  let shape = req.body.comp.split(" ")[0];
  let index = Number(req.body.comp.split(" ")[1]) -1;
  //find what shape element type it should be
  switch(shape){
    case "SVG":
      shape = 0
      break;
    case "Circle":
      shape = 1;
      break;
    case "Rectangle":
      shape = 2;
      break;
    case "Path":
      shape = 3;
      break;
    case "Group":
      shape = 4;
      break;
    default:
      console.log("This shouldnt happen");
      break;
  }

  //buffer for passing to C functions
  let fileBuffer = Buffer.alloc(("uploads/" + req.body.fileName).length+1);
  fileBuffer.write("uploads/" + req.body.fileName);
  let keyBuffer = null;
  let valueBuffer = null;
  let errorCode = 0;
  let failedString = ""
  for(let [key,value] of Object.entries(req.body)){

    if(value != "" && key != "comp" && key != "fileName" && key != "newAttrValue"){
      if(key == "newAttrName" && req.body.newAttrValue != ""){
        key = req.body.newAttrName;
        value = req.body.newAttrValue;
      }
      if(key == "title" || key == "descr"){
        if(value.length>255){//too long
            failedString+= key + " was to long ";
            continue;
        }
      }
      //dont know why we had to name it this in the first place
      if(key =="desrc") key = "desr";
      if(key == "w") key = "width";
      if(key == "h") key = "height";
      //check if elements are numeric
      if(["cx","cy","r","x","y","w","h"].includes(key)){
        if(isNaN(value)){
          failedString+= key + " is nonnumeric ";
          continue;
        }
      }
      //sets buffers
      keyBuffer = Buffer.alloc(key.length + 1);
      keyBuffer.write(key);
      valueBuffer = Buffer.alloc(value.length + 1);
      valueBuffer.write(value);
      //adds attribute to list
      errorCode = svgParser.setAttributeToFile(fileBuffer,shape,index,keyBuffer,valueBuffer);
      if(!errorCode) failedString+= key + " ";
    }
  }
  if(failedString == "") res.send("All Attributes were added");
  else res.send("Attributes " + failedString + "Failed to be added");
});
//sends image data
app.get("/getimagedata", (req,res) => {
    //sample svg is {fileName: "name",size:1kb,data:{rect,circle,path,groups}}

    let fileBuffer = Buffer.alloc(("./uploads/"+req.query.fileName).length+1);
    fileBuffer.write("./uploads/"+req.query.fileName);
    //gets components from c
    let compStr = svgParser.getComponents(fileBuffer);

    let comp = null;
    if(compStr != null){
      try{
        comp = JSON.parse(compStr.toString("utf-8"));
      } catch(err){
        console.log("failed to parse JSON");
        return res.send(null);
      }
    }
    if(comp){ //sends data
      console.log(req.query.fileName + "data was received");
      comp.fileName = req.query.fileName;
      res.send(comp);
    } else {
      console.log(req.query.fileName + "data failed to be retrived");
    }


});


app.get("/addCircle", (req,res) => {
    //alloc and write the filename to a buffer
    let fileBuffer = Buffer.alloc(("./uploads/"+req.query.fileName).length+1);
    fileBuffer.write("./uploads/"+req.query.fileName);
    //alloc for the JSON
    let circleBuffer = Buffer.alloc(req.query.shape.length+1);
    circleBuffer.write(req.query.shape)

    let errorCode = svgParser.addComponentToFile(fileBuffer,0,circleBuffer);
    if(errorCode == 1) console.log("Circle was added");
    else console.log("Circle failed to be added");
    res.send({errorCode:errorCode})
});
app.get("/addRect", (req,res) => {
   //alloc for the filename
    let fileBuffer = Buffer.alloc(("./uploads/"+req.query.fileName).length+1);
    fileBuffer.write("./uploads/"+req.query.fileName);
    //alloc for the JSON
    let rectBuffer = Buffer.alloc(req.query.shape.length+1);
    rectBuffer.write(req.query.shape)

    let errorCode = svgParser.addComponentToFile(fileBuffer,1,rectBuffer);
    if(errorCode == 1) console.log("Rectangle was added");
    else console.log("Rectangle failed to be added");
    res.send({errorCode:errorCode});
});

//post request for scaling the image
app.post("/scale",(req,res) =>{
    //alloc for the filename
     let fileBuffer = Buffer.alloc(("./uploads/"+req.body.fileName).length+1);
     fileBuffer.write("./uploads/"+req.body.fileName);

     if(!req.body.factor){
         res.send("Please Select a Scale Factor");
         return;
     }
     if(!req.body.scaleType){
         res.send("Plese Select a Scale Type");
         return;
     }
     let errorCode = svgParser.scaleShapes(fileBuffer,Number(req.body.scaleType),Number(req.body.factor))

     if(errorCode){
         res.send("shapes could not be scaled");
     }else{
         res.send("Shapes were scaled");
     }
});

//post request for login into the database
app.post("/login", async (req,res) => {
  try{
    let connection = await mysql.createConnection({
      host: 'dursley.socs.uoguelph.ca',
      user: req.body.username,
      password: req.body.password,
      database: req.body.databaseName});
    //create tables
    await createTables(connection);
    connection.close();
    return res.send({string:"Login Success",error:0});
  } catch(e){
    return res.send({string:"Login Failed",error:1});
  }

});

//creates the tables for data bases
async function createTables(connection){
  try{
    await connection.execute(`CREATE TABLE FILE(
      svg_id INT AUTO_INCREMENT,
      file_name VARCHAR(60) NOT NULL,
      file_title VARCHAR(256),
      file_description VARCHAR(256),
      n_rect INT NOT NULL,
      n_circ INT NOT NULL,
      n_path INT NOT NULL,
      n_group INT NOT NULL,
      creation_time DATETIME NOT NULL,
      file_size INT NOT NULL,
      PRIMARY KEY(svg_id));`);
  } catch(e){}
  try{
    await connection.execute(`CREATE TABLE IMG_CHANGE(
      change_id INT AUTO_INCREMENT,
      change_type VARCHAR(256) NOT NULL,
      change_summary VARCHAR(256) NOT NULL,
      change_time DATETIME NOT NULL,
      svg_id INT NOT NULL,
      PRIMARY KEY(change_id),
      FOREIGN KEY (svg_id) REFERENCES FILE(svg_id) ON DELETE CASCADE);`);
  } catch(e){console.log(e);}
  try{
    await connection.execute(`CREATE TABLE DOWNLOAD(
      download_id INT AUTO_INCREMENT,
      d_descr VARCHAR(256) NOT NULL,
      svg_id INT NOT NULL,
      PRIMARY KEY(download_id),
      FOREIGN KEY (svg_id) REFERENCES FILE(svg_id) ON DELETE CASCADE);`);
  } catch(e){console.log(e);}

}

//add all files to the table
app.get("/addFilesDB", async (req,res) => {
  let svg = {SVGimages:[]};
  try{
    let connection = await mysql.createConnection(req.query.connectionInfo);
    let files = fs.readdirSync("uploads/");
    for(let file of files){
      if(!file.endsWith("svg")){
            console.log(file + " is not an svg");
            continue; //ignores none svg files
          }
          let fileBuffer = Buffer.alloc(("./uploads/"+file).length+1);
          fileBuffer.write("./uploads/"+file);
          let imgStr = svgParser.getValidSVGimage(fileBuffer);
          if(imgStr != null){
            let img;
            try{
              img = JSON.parse(imgStr.toString("utf-8").replace(/\n/g," "));
            } catch(err){
              console.log("failed to parse JSON for " + file);
              continue;
            }
            let compStr = svgParser.getComponents(fileBuffer);
            let comp = null;
            if(compStr != null){
              try{
                comp = JSON.parse(compStr.toString("utf-8"));
                console.log(comp);
              } catch(err){
                console.log("failed to parse JSON");
                continue;
              }
            }
            img.fileName = file;
            img.size = sizeOfFile(file)
            const [rows,fields] = await connection.execute(`SELECT * from FILE WHERE file_name = '${file}'`);
            //DNE
            if(rows.length == 0){
              await connection.execute(`INSERT INTO FILE (svg_id,file_name,file_title,file_description,n_rect,n_circ,n_path,n_group,creation_time,file_size)
                  VALUES (NULL,'${file}','${comp.title}','${comp.desc}',${img.numRect},${img.numCirc},${img.numPaths},${img.numGroups},CURRENT_TIMESTAMP(),${parseInt(img.size)})`);
            }
          } else {
            console.log(file + " is not valid or could not be read");
          }
    }
    connection.end();
  } catch(e){console.log(e);}

  return res.send({string:"Files created",error:0});
});

//deletes all files from table
app.get("/deleteFilesDB", async (req,res) =>{
  try{
    let connection = await mysql.createConnection(req.query.connectionInfo);
    await connection.execute("DELETE FROM FILE");
    connection.end();
  }catch(e){console.log(e);}
  return res.send({string:"Files Deleted",error:0});
});
app.listen(portNum);
console.log('Running app at localhost: ' + portNum);

//finds info about the database
app.get("/DBStatus", async (req,res) => {
  let info = {}
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);
    info.numFiles = (await connection.execute("SELECT COUNT(*) FROM FILE;"))[0][0]["COUNT(*)"];
    info.numDownloads = (await connection.execute("SELECT COUNT(*) FROM DOWNLOAD;"))[0][0]["COUNT(*)"];
    info.numChanges = (await connection.execute("SELECT COUNT(*) FROM IMG_CHANGE;"))[0][0]["COUNT(*)"];
    connection.end();
  }catch(e){console.log(e);}
  return res.send(info);
})

//adds download info to db
app.get('/addDownloadDB', async (req,res) => {
  //ip of user
  console.log("she aint work");
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);
    let svg_id = (await connection.execute(`SELECT svg_id from FILE WHERE file_name = '${req.query.name}'`))[0][0];
    console.log(svg_id);
    //checks if its in the data base if it isnt return doing nothing
    if(svg_id == "undefined"){
      return res.send("file not in database");
    }
    svg_id = svg_id["svg_id"]
    await connection.execute(`INSERT DOWNLOAD (download_id,d_descr,svg_id) VALUES(NULL,'${String(req.ip)}',${svg_id})`)
    connection.end();
  }catch(e){console.log(e);}
  return res.send("file added to downlaod db");
});

app.get('/addChangeToDB', async (req,res) =>{
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);
    let svg_id = (await connection.execute(`SELECT svg_id from FILE WHERE file_name = '${req.query.fileName}'`))[0][0];
    console.log(svg_id);
    //checks if its in the data base if it isnt return doing nothing
    if(svg_id == "undefined"){
      return res.send("file not in database");
    }
    svg_id = svg_id["svg_id"];
    console.log(svg_id);
    await connection.execute(`UPDATE FILE SET file_size = ${sizeOfFile(req.query.fileName)} WHERE  svg_id = ${svg_id};`);
    await connection.execute(`INSERT IMG_CHANGE(change_id,change_type,change_summary,change_time,svg_id)
        VALUES (NULL,'${req.query.change_type}','${req.query.change_summary}',CURRENT_TIMESTAMP(),${svg_id});`);
    connection.end();
  }catch(e){console.log(e);}
  return res.send("file added to change db");
})

app.get("/all-files-query", async (req,res) =>{
  let data,fields = null;
  let returnData = {string:`<tr>
      <td>File Name</td>
      <td>File Title</td>
      <td>File Desc</td>
      <td>Rect Count</td>
      <td>Circ Count</td>
      <td>Path Count</td>
      <td>Group Count</td>
      <td>Creation Time</td>
      <td>File Size(KB)</td>
    </tr>`};
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);
    [data, fields] = await connection.execute("SELECT * FROM FILE ORDER BY " + req.query.sort);


    for(let obj of data){
      returnData.string += `<tr>
      <td>${obj.file_name}</td>
      <td>${obj.file_title}</td>
      <td>${obj.file_description}</td>
      <td>${obj.n_rect}</td>
      <td>${obj.n_circ}</td>
      <td>${obj.n_path}</td>
      <td>${obj.n_group}</td>
      <td>${obj.creation_time}</td>
      <td>${obj.file_size}</td>
      </tr>`
    }
    if(data.length == 0){
      returnData.string += "<tr><td>No Files Found</td></tr>"
    }
    connection.end();
  }catch(e){console.log(e);}
  return res.send(returnData);
});

app.get("/files-created-query", async (req,res) =>{
  let data,fields = null;
  let returnData = {string:`<tr>
      <td>File Name</td>
      <td>File Title</td>
      <td>File Desc</td>
      <td>Rect Count</td>
      <td>Circ Count</td>
      <td>Path Count</td>
      <td>Group Count</td>
      <td>Creation Time</td>
      <td>File Size(KB)</td>
    </tr>`};
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);

    [data, fields] = await connection.execute(`SELECT * FROM FILE WHERE creation_time >= '${req.query.startDate}' AND creation_time <= '${req.query.endDate}' ORDER BY ${req.query.sort}`);


    for(let obj of data){
      returnData.string += `<tr>
      <td>${obj.file_name}</td>
      <td>${obj.file_title}</td>
      <td>${obj.file_description}</td>
      <td>${obj.n_rect}</td>
      <td>${obj.n_circ}</td>
      <td>${obj.n_path}</td>
      <td>${obj.n_group}</td>
      <td>${obj.creation_time}</td>
      <td>${obj.file_size}</td>
      </tr>`
    }
    if(data.length == 0){
      returnData.string += "<tr><td>No Files Found</td></tr>"
    }

    connection.end();
  }catch(e){console.log(e);}
  return res.send(returnData);
});
//get date mod date changes filename file
app.get("/files-mod-query", async (req,res) =>{
  let data,fields = null;
  let returnData = {string:`<tr>
      <td>File Name</td>
      <td>File Size</td>
      <td>Recent Change</td>
      <td>Number Of Changes</td>
    </tr>`};
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);

    //create table with max change time and how many times each one was changed
    await connection.execute(`CREATE VIEW MODIFIED(svg_id,n_mod,change_time)
      AS SELECT i.svg_id, COUNT(*), MAX(change_time)
      FROM IMG_CHANGE as i
      WHERE (change_time >= '${req.query.startDate}' AND change_time <= '${req.query.endDate}')
      GROUP BY i.svg_id ; `);

    //merges modified with file table and orders it to spec
    [data, fields] = await connection.execute(`SELECT * FROM MODIFIED
      right OUTER JOIN
      FILE ON MODIFIED.svg_id = FILE.svg_id
      ORDER BY ${req.query.sort} ${(req.query.sort == "change_time")? "DESC":""};`);

    //gets rid of the used temp view
    await connection.execute("DROP VIEW MODIFIED");

    for(let obj of data){
      if(!obj.n_mod) obj.n_mod = 0;
      if(!obj.change_time) obj.change_time = "NA"
      returnData.string += `<tr>
      <td>${obj.file_name}</td>
      <td>${obj.file_size}</td>
      <td>${obj.change_time}</td>
      <td>${obj.n_mod}</td>
      </tr>`

    }
    if(data.length == 0){
      returnData.string += "<tr><td>No Files Found</td></tr>"
    }

    connection.end();
  }catch(e){console.log(e);}
  return res.send(returnData);
});

app.get("/files-shape-query", async (req,res) =>{
  let data,fields = null;
  let returnData = {string:`<tr>
      <td>File Name</td>
      <td>File Title</td>
      <td>File Desc</td>
      <td>Rect Count</td>
      <td>Circ Count</td>
      <td>Path Count</td>
      <td>Group Count</td>
      <td>Creation Time</td>
      <td>File Size(KB)</td>
    </tr>`};
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);
    [data, fields] = await connection.execute(`SELECT * FROM FILE
      WHERE ${req.query.type} >= ${req.query.lower} AND ${req.query.type} <= ${req.query.upper}
      ORDER BY ` + req.query.sort);


    for(let obj of data){
      returnData.string += `<tr>
      <td>${obj.file_name}</td>
      <td>${obj.file_title}</td>
      <td>${obj.file_description}</td>
      <td>${obj.n_rect}</td>
      <td>${obj.n_circ}</td>
      <td>${obj.n_path}</td>
      <td>${obj.n_group}</td>
      <td>${obj.creation_time}</td>
      <td>${obj.file_size}</td>
      </tr>`
    }
    if(data.length == 0){
      returnData.string += "<tr><td>No Files Found</td></tr>"
    }
    connection.end();
  }catch(e){console.log(e);}
  return res.send(returnData);
});

app.get("/files-n-query", async (req,res) =>{
  let data,fields = null;
  let returnData = {string:`<tr>
      <td>File Name</td>
      <td>File Size</td>
      <td>Number Of Download</td>
    </tr>`};
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);

    //create table with max change time and how many times each one was changed
    await connection.execute(`CREATE VIEW MODIFIED(svg_id,n_downlaod)
      AS SELECT svg_id, COUNT(*)
      FROM DOWNLOAD
      GROUP BY svg_id ; `);

    //merges modified with file table and orders it to spec
    [data, fields] = await connection.execute(`SELECT * FROM MODIFIED
      right OUTER JOIN
      FILE ON MODIFIED.svg_id = FILE.svg_id
      ORDER BY ${req.query.sort} ${(req.query.sort != "file_name")? "DESC":""};`);

    //gets rid of the used temp view
    await connection.execute("DROP VIEW MODIFIED");


    for(let obj of data){
      //prints n instances
      if(req.query.nCount-- == 0) break;

      if(!obj.n_downlaod) obj.n_downlaod = 0;
      returnData.string += `<tr>
      <td>${obj.file_name}</td>
      <td>${obj.file_size}</td>
      <td>${obj.n_downlaod}</td>
      </tr>`

    }
    if(data.length == 0){
      returnData.string += "<tr><td>No Files Found</td></tr>"
    }

    connection.end();
  }catch(e){console.log(e);}
  return res.send(returnData);
});

app.get("/changes-query", async (req,res) =>{
  let data,fields = null;
  let returnData = {string:`<tr>
      <td>File Name</td>
      <td>Change Type</td>
      <td>Change Summary</td>
      <td>Time of Change</td>
    </tr>`};
  try{
    //gets length from all tables
    let connection = await mysql.createConnection(req.query.connectionInfo);

    //merges modified with file table and orders it to spec
    [data, fields] = await connection.execute(`SELECT * FROM IMG_CHANGE
      right OUTER JOIN
      FILE ON IMG_CHANGE.svg_id = FILE.svg_id
      WHERE FILE.file_name = '${req.query.file_name}'
      AND (change_time >= '${req.query.startDate}' AND change_time <= '${req.query.endDate}')
      ORDER BY ${req.query.sort} ${(req.query.reverse)? "DESC":""};`);


    for(let obj of data){
      returnData.string += `<tr>
      <td>${obj.file_name}</td>
      <td>${obj.change_type}</td>
      <td>${obj.change_summary}</td>
      <td>${obj.change_time}</td>
      </tr>`

    }
    if(data.length == 0){
      returnData.string += "<tr><td>No Files Found</td></tr>"
    }

    connection.end();
  }catch(e){console.log(e);}
  return res.send(returnData);
});


/**HELPER FUCNTIONS*/
function sizeOfFile(fileName){ //divide by 1024 to get kb
    return fs.statSync("uploads/"+fileName).size/1024;
}
