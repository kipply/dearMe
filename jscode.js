var spawn = require('child_process').spawn;
child = spawn('java', ['-jar', 'SentimentCore.jar']);

child.stdin.setEncoding('utf-8');
child.stdout.pipe(process.stdout);

child.stdin.write("Monsieur Hire, a misanthropic and voyeuristic tailor, spies on his gorgeous neighbour Alice from across the street. The development of their relationship takes place against the backdrop of another plot, the unsolved murder of a local young woman. Monsieur Hire is hounded by a detective investigating the murder and is also eventually noticed by Alice. Hire propositions Alice to ditch her boyfriend Emile and run off with him to his little home in Switzerland, where he promises to take care of her.\n");
child.stdin.write("EOF\n");

child.stdout.on('data', function (data) {
  console.log('stdout: ' + data.toString());
});
