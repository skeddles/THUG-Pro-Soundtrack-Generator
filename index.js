var fs = require('fs');
var path = require('path');




console.log('\n\n===================================');
console.log('THUG PRO SOUNDTRACK GENERATOR');
console.log('Created by @skeddles (samkeddy.com)\n');

const MUSICPATH = './music files';

fs.mkdir(MUSICPATH, function(err) {
	
	//error
	if (err) {
		//already exists
		if (err.code == 'EEXIST') {
			getFiles();
		}
		
		//some other error
		else console.log('error:',err);
	}
	
	//folder was successfully created
	else {
		console.log('A folder called "music files" has been created. Copy all of your .bik files into this folder.');
		
		const readline = require('readline').createInterface({
		  input: process.stdin,
		  output: process.stdout
		});

		readline.question('Press enter to continue...\n', (name) => {
			readline.close();
			getFiles();
		});
	}

});

function getFiles() {
	//get list of files in music folder
	fs.readdir(MUSICPATH, function(err, files) {
		if (err) console.log('error:',err)
		
		//filter out any files without bik extention
		files = files.filter(f=>f.includes('.bik'));
		
		//files were found
		if (files.length > 0) {
			console.log(files.length + ' music files found');
			
			//next step
			getName(files);
		} 
		
		//files not found
		else {
			console.log('\nNo music files were found in the "music files" directory. Please copy all of your .bik files there now.');
	
			const readline = require('readline').createInterface({
			  input: process.stdin,
			  output: process.stdout
			});

			readline.question('Press enter to continue...\n', (name) => {
				readline.close();
				getFiles();
			});

		}
	});
}

//get additional package info from user
function getName (files) {
	const readline = require('readline').createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	readline.question('\nWhat do you wish to name your soundtrack? ', (name) => {
		readline.close();
		
		var slug = slugify(name);
		
		if (slug.length < 1) return getInfo();
		
		console.log('\nPackage Name: '+name);
		console.log('Folder Name: '+slug);
		
		//next step
		getFormat(files,name,slug);
	});
}
//get additional package info from user
function getFormat (files,name,slug) {
	const readline = require('readline').createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	readline.question('\n How are your song files named?\n1 = Artist - Song Name\n2 = Song Name - Artist\n', (type) => {
		readline.close();
		
		//wrong input, ask again
		if (type != 1 && type != 2) {
			console.log('\n  !!please enter either 1 or 2!!');
			getFormat(files,name,slug);
		}
		
		//next step
		else generateFiles(files,name,slug,type == 1);
		

	});
}

function generateFiles (files,name,slug,artistFirst) {

	//prepare export object
	var outObject = {
		soundtrack_folder: slug,
		soundtrack_name: name,
		num_tracks: 0,
		tracks: []
	}

	//format tracks
	outObject.tracks = files.map((filepath)=>{
		var filename = filepath.replace('.bik','');
		var name = filename.split(/\s*-\s*/);
		var band = artistFirst? name[0] : name[1];
		var title = artistFirst? name[1] : name[0];
		
		return {  
		  band: band,
		  title: title,
		  filename: filename,
		  genre: 0
		}
	});
	
	//update track count
	outObject["num_tracks"] = outObject.tracks.length;

	//create exports folder
	fs.mkdir('exports', function(err) {
		if (err && err.code != 'EEXIST') console.log(err);

		//save readme file to exports
		fs.writeFileSync(path.join('exports','README.txt'), readme(name));
		
		//create name folder
		fs.mkdir(path.join('exports',name), function(err) {
			if (err && err.code != 'EEXIST') console.log(err);	
			
			//create sound.json file
			fs.writeFileSync(path.join('exports',name,slug+'.sound.json'), JSON.stringify(outObject));
			
			//create Data folder
			fs.mkdir(path.join('exports',name,'Data'), function(err) {
				if (err && err.code != 'EEXIST') console.log(err);
				
				//create Music folder
				fs.mkdir(path.join('exports',name,'Data','Music'), function(err) {
					if (err && err.code != 'EEXIST') console.log(err);
					
					//create slug folder
					fs.mkdir(path.join('exports',name,'Data','Music',slug), function(err) {
						if (err && err.code != 'EEXIST') console.log(err);
						
						//copy all music files over
						files.forEach( f => fs.copyFileSync(path.join('music files',f),path.join('exports',name,'Data','Music',slug,f)));
						
						});		
				});	
			});		
		});		
	});
}

function slugify (text) {
  return text.toString()
		.toLowerCase()					//make all lowercase
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/\//g, '-')           // Replace slashes with -
        .replace(/[^a-z0-9-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function readme(name) {
	return `
${name} Soundtrack for THUG Pro\r\n
\r\n
To Install:\r\n
\r\n
1. Navigate to your THUG Pro install folder (usually "%LocalAppData%/THUG Pro")\r\n
2. Copy all of the files in the "/${name}" folder to "THUG Pro/User"\r\n
3. Start THUG Pro, go to music settings and select the soundtrack.\r\n
\r\n
_______________________________\r\n
Soundtrack compiled using THUG Pro Soundtrack Generator by skeddles\r\n
 samkeddy.com | twitter.com/skeddles\r\n
	`;
}