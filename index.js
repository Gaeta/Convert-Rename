const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
let input, output;
var argv = require('minimist')(process.argv.slice(2), {
    default: {
      output: './output',
      input: './input',
      rename: 'uuid',
      compress: true,
      quality: 70
    }
});

try {
  console.log('Checking Output Path');
  output = fs.statSync(path.join(__dirname, argv.output));
  if (!output.isDirectory()) throw error;
  output = path.join(__dirname, argv.output);
  console.log('Output Set.');
} catch (e) {
  if (e.toString().includes('no such file or directory')) {
    console.log(`${path.join(__dirname, argv.output)} does not exist!`);
  } else {
    console.error(e);
  }
  return process.exit(1);
}

try {
  console.log('Checking Input Path');
  input = fs.statSync(path.join(__dirname, argv.input));
  if (!input.isDirectory()) throw error;
  input = path.join(__dirname, argv.input);
  console.log('Input Set.');
} catch (e) {
  if (e.toString().includes('no such file or directory')) {
    console.log(`${path.join(__dirname, argv.input)} does not exist!`);
  } else {
    console.error(e);
  }
  return process.exit(1);
}

console.log(`Starting... Compress?: ${argv.compress !== 'false' ? 'enabled' : 'disabled'} Quality: ${Number(argv.quality)} Renaming?: ${argv.rename === 'uuid' ? 'random uuid' : (argv.rename === 'false' ? 'disabled' : `as, ${argv.rename}`)}`);

console.log('Looking for files...');
fs.readdir(input, async (err, files) => {
  if (err) throw err;
  files = files.filter(f => f.split(".").pop().match(/(jpg|jpeg|png)$/));
  if (files.length <= 0) return console.log('Missing input files.');
  for (i=0; i < files.length; i++) {
    const file = files[i];
    const index = i;
    console.log(`Reading ${path.join(input, file)}`)
    fs.readFile(path.join(input, file), async (err, data) => {
      if (err) throw err;
      if (argv.compress !== 'false') {
        // Compress then rewrite
        await imagemin.buffer(data, {
          plugins: [
            imageminMozjpeg({
              quality: Number(argv.quality)
            }),
            imageminPngquant({
              quality: Number(argv.quality)
            })
          ]
        }).then(async g => {
          if (argv.rename === 'false') {
            //no rename just save the dam file to the output path
            fs.writeFile(path.join(output, file.replace(file.split('.').pop(), 'png')), g, function (err) {
              if (err) return console.log(err);
              console.log(`Finished ${file} => ${file.replace(file.split('.').pop(), 'png')}`)
            });
          } else {
            const name = argv.rename === 'uuid' ? uuidv4() : argv.rename + '' + index;
            fs.writeFile(path.join(output, name + '.png'), g, function (err) {
              if (err) return console.log(err);
              console.log(`Finished ${file} => ${name}.png`)
            });
          }
        })
      } else {
        //Other Options
        if (argv.rename === 'false') {
          //no rename just save the dam file to the output path
          fs.writeFile(path.join(output, file.replace(file.split('.').pop(), 'png')), data, function (err) {
            if (err) return console.log(err);
            console.log(`Finished ${file} => ${file.replace(file.split('.').pop(), 'png')}`)
          });
        } else {
          //rename
          const name = argv.rename === 'uuid' ? uuidv4() : argv.rename + '' + index;
            fs.writeFile(path.join(output, name + '.png'), data, function (err) {
              if (err) return console.log(err);
              console.log(`Finished ${file} => ${name}.png`)
            });
        }
      }
    })
  }
});