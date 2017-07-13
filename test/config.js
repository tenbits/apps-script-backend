module.exports = {
	$config: {
		$before: function(){
			include
				.cfg('amd', true)
				.cfg('extentionDefault', { js: 'ts' });
				;

		}
	},
    suites: {
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