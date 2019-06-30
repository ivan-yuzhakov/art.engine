<div id="plugins">
	<div class="list box">
		<div class="header">
			<div class="actions">
				<div class="br3 animate21 add_plugin"><?php echo $lang['settings_plugins_add_plugin']; ?></div>
			</div>
			<div class="title"><?php echo $lang['section_plugins']; ?></div>
		</div>
		<div class="plugins">
			<div class="plugin" data="{{id}}">
				<div class="image">{{image}}</div>
				<div class="title">{{title}}</div>
				<div class="desc">{{desc}}</div>
				{{switch}}
				<div class="action show animate2" title="Showing the main menu"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 95"><path d="M47.5 20.9C16.337 20.9 0 43.86 0 47.5c0 3.64 16.337 26.6 47.5 26.6C78.66 74.1 95 51.14 95 47.5c0-3.64-16.34-26.6-47.5-26.6zm0 47.062c-11.66 0-21.112-9.16-21.112-20.462S35.84 27.038 47.5 27.038s21.11 9.16 21.11 20.462-9.45 20.462-21.11 20.462zM58.055 47.5c0 5.65-4.727 10.232-10.555 10.232-5.83 0-10.555-4.582-10.555-10.232S41.67 37.27 47.5 37.27c3.15 0-1.933 8.107 0 10.23 1.643 1.803 10.555-2.595 10.555 0z"/></svg></div>
				<div class="action setting animate2" title="Settings plugin"><svg viewBox="0 0 32 32"><path d="M 27.526,12.682c-0.252-0.876-0.594-1.71-1.028-2.492l 1.988-4.182c-0.738-0.92-1.574-1.756-2.494-2.494 l-4.182,1.988c-0.78-0.432-1.616-0.776-2.492-1.028L 17.762,0.102C 17.184,0.038, 16.596,0, 16,0S 14.816,0.038, 14.238,0.102L 12.682,4.474 C 11.808,4.726, 10.972,5.070, 10.192,5.502L 6.008,3.514c-0.92,0.738-1.756,1.574-2.494,2.494l 1.988,4.182 c-0.432,0.78-0.776,1.616-1.028,2.492L 0.102,14.238C 0.038,14.816,0,15.404,0,16s 0.038,1.184, 0.102,1.762l 4.374,1.556 c 0.252,0.876, 0.594,1.71, 1.028,2.492l-1.988,4.182c 0.738,0.92, 1.574,1.758, 2.494,2.494l 4.182-1.988 c 0.78,0.432, 1.616,0.776, 2.492,1.028l 1.556,4.374C 14.816,31.962, 15.404,32, 16,32s 1.184-0.038, 1.762-0.102l 1.556-4.374 c 0.876-0.252, 1.71-0.594, 2.492-1.028l 4.182,1.988c 0.92-0.738, 1.758-1.574, 2.494-2.494l-1.988-4.182 c 0.432-0.78, 0.776-1.616, 1.028-2.492l 4.374-1.556C 31.962,17.184, 32,16.596, 32,16s-0.038-1.184-0.102-1.762L 27.526,12.682z M 16,24 c-4.418,0-8-3.582-8-8c0-4.418, 3.582-8, 8-8s 8,3.582, 8,8C 24,20.418, 20.418,24, 16,24zM 12,16A4,4 1080 1 0 20,16A4,4 1080 1 0 12,16z"></path></svg></div>
			</div>
		</div>
	</div>

	<div class="overlay loader animate2"></div>

	<div class="form box animate2">
		<div class="header">
			<div class="actions">
				<div class="br3 save"><?php echo $lang['global_save']; ?></div>
				<div class="br3 save_close"><?php echo $lang['global_save_and_close']; ?></div>
				<div class="br3 close"><?php echo $lang['global_close']; ?></div>
			</div>
			<div class="title">Settings of plugin "{{plugin_name}}"</div>
		</div>
		<div class="wrapper">{{plugin_form}}</div>
	</div>

	<div class="upload br3 animate2">
		<div class="header">
			<div class="close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"/></svg></div>
			<div class="title">Plugins</div>
		</div>
		<div class="plugins">
			<div class="plugin" data="{{alias}}">
				<div class="image">{{image}}</div>
				<div class="title">{{title}}</div>
				<div class="desc">{{desc}}</div>
			</div>
		</div>
	</div>
</div>