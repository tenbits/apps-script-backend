module.exports = {
    suites: {
		// 'dom': {
		// 	exec: 'dom',
		// 	env: [
        //         '/build/backend/test.js',
        //         '/google-spreadsheet/test-google-mock.js'
        //     ],
		// 	tests: 'dom/**',
		// },
		'node': {
			exec: 'node',
			tests: 'test/**.test',
			env: [
                '/src/apps-script-mock.js::global'
            ],
			$config: {
				$before: function(){
					include
						.cfg('amd', true)
						.cfg('extentionDefault', { js: 'ts' });
						;

				}
			}
		}		
	}
};