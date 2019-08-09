<div id="files">
	<div class="list animate2">
		<div class="items animate2 box" parent="{{parent}}" style="width:{{width}}px;">
			<div class="header">
				<div class="actions">
					<div class="br3 add_files animate1"><?php echo $lang['files_header_add_files']; ?></div>
					<div class="br3 add_group animate1"><?php echo $lang['files_header_add_group']; ?></div>
					<div class="br3 menu">
						<div class="icon"><p class="p1 br3"></p><p class="p2 br3"></p><p class="p3 br3"></p></div>
						<div class="popup animate1"><div class="marker"></div><div class="wrapper br3">
							<p class="br3" data="select_all"><?php echo $lang['files_header_select_all']; ?></p>
							<p class="br3" data="unselect_all"><?php echo $lang['files_header_unselect_all']; ?></p>
							<p class="br3 remove" data="remove_selected"><?php echo $lang['files_header_remove_selected']; ?></p>
						</div></div>
					</div>
				</div>
				<div class="title">{{title}}</div>
			</div>
			<div class="scroll">
				<div class="viewport"><div class="overview">
					<div class="groups">
						<div id="g{{id}}" class="g br3 {{class}}" data="{{id}}">
							<p class="select"><b><i class="animate1"></i></b></p>
							<p class="edit"><?php echo $icons['edit']; ?></p>
							<p class="info" title="ID {{id}}">
								<span class="count">{{count}}</span>
								<span class="title">{{title}}</span>
							</p>
						</div>
					</div>
					<div class="files">
						<div id="f{{id}}" class="f box {{class}}" data="{{id}}">
							<div class="inner"><div class="wrapper box br3 animate1">
								<p class="image br3 animate1" {{image}}>{{icon}}</p>
								<p class="edit br3 animate1"><?php echo $icons['edit']; ?></p>
								<p class="title" title="{{title}}">{{title}}</p>
							</div></div>
						</div>
					</div>
				</div></div>
				<div class="scrollbar animate1"><div class="track"><div class="thumb br3"></div></div></div>
			</div>
		</div>
	</div>

	<div class="overlay loader animate2"></div>

	<div class="form box animate2">
		<div class="header">
			<div class="actions">
				<div class="br3 save"><?php echo $lang['files_form_save']; ?></div>
				<div class="br3 save_close"><?php echo $lang['files_form_save_and_close']; ?></div>
				<div class="br3 close"><?php echo $lang['files_form_close']; ?></div>
			</div>
			<div class="title">{{title}}</div>
		</div>
		<div class="wrapper">
			<div class="container">
				<div class="field text">
					<div class="head"><p><?php echo $lang['files_form_input_source']; ?></p></div>
					<div class="group">
						<input id="filename" class="br3 box animate1" type="text" value="" disabled>
					</div>
				</div>
			</div>
			<div class="container">
				<label class="field text">
					<div class="head"><p><?php echo $lang['files_form_input_title']; ?></p></div>
					<div class="group">
						<input id="title" class="br3 box animate1" type="text" value="">
					</div>
				</label>
			</div>
			<div class="container">
				<label class="field text">
					<div class="head"><p><?php echo $lang['files_form_input_desc']; ?></p></div>
					<div class="group">
						<input id="desc" class="br3 box animate1" type="text" value="">
					</div>
				</label>
			</div>
			{{childs}}
		</div>
	</div>

	<div class="upload box br3 animate2">
		<div class="header">
			<div class="progress animate2"></div>
			<div class="actions">
				<div class="br3 save_close"><?php echo $lang['files_upload_save_and_close']; ?></div>
			</div>
			<div class="title"><?php echo $lang['files_upload_title']; ?></div>
		</div>
		<div class="wrapper"></div>
		<div class="footer"></div>
	</div>
</div>