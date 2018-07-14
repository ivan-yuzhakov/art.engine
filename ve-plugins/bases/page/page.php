<div id="plugin_bases_page">
	<div class="list box animate2">
		<div class="s1">
			<div class="header s1">
				<div class="actions">
					<div class="br3 animate1 create create_base"><?php echo $lang['bases_list_header_create']; ?></div>
				</div>
				<div class="title"><?php echo $lang['bases_list_header_title']; ?></div>
			</div>
			<div class="wrapper s1"><div class="bases">
				<a href="#/plugins/bases/{{id}}" class="base br3 {{classes}}" data="{{id}}">
					<p class="title">{{title}}</p>
					<p class="edit edit_base br3 animate1">{{icon_edit}}</p>
					<p class="remove remove_base br3 animate1">{{icon_remove}}</p>
				</a>
			</div></div>
		</div>
		<div class="s2">
			<div class="header s2">
				<div class="actions">
					<div class="br3 animate1 create create_item"><?php echo $lang['bases_i_list_header_create_item']; ?></div>
					<div class="br3 animate1 create create_pdf"><?php echo $lang['bases_i_list_header_create_pdf']; ?></div>
					<div class="filter animate">
						<input class="br3 box animate1" type="text" placeholder="<?php echo $lang['bases_i_list_header_filter']; ?>">
					</div>
					<div class="br3 menu">
						<div class="icon"><p class="p1 br3"></p><p class="p2 br3"></p><p class="p3 br3"></p></div>
						<div class="popup animate1"><div class="marker"></div><div class="wrapper br3">
							<p class="br3" data="select_all"><?php echo $lang['bases_i_list_header_select_all']; ?></p>
							<p class="br3" data="unselect_all"><?php echo $lang['bases_i_list_header_unselect_all']; ?></p>
							<p class="br3 cifs" data="create_items_from_selected"><?php echo $lang['bases_i_list_header_create_items_from_selected']; ?></p>
							<p class="br3 clone" data="clone_selected"><?php echo $lang['bases_i_list_header_clone_selected']; ?></p>
							<p class="br3 remove" data="remove_selected"><?php echo $lang['bases_i_list_header_remove_selected']; ?></p>
						</div></div>
					</div>
				</div>
				<div class="title">{{title}}</div>
			</div>
			<div class="wrapper s2"><div class="items br3"></div></div>
			<div class="pdf s2 br3 box animate2">
				<div class="close"></div>
				<div class="title"><?php echo $lang['bases_i_list_header_create_pdf']; ?></div>
				<div class="langs br3"></div>
				<div class="templates"><div class="loader br3"></div></div>
				<div class="requests"></div>
				<a class="link br3 animate1" href="#" target="_blank"><?php echo $lang['bases_i_list_header_create_pdf']; ?></a>
			</div>
		</div>
	</div>

	<div class="overlay loader animate2"></div>

	<div class="form box animate2">
		<div class="s1">
			<div class="header s1">
				<div class="actions">
					<div class="br3 save"><?php echo $lang['bases_form_save']; ?></div>
					<div class="br3 save_close"><?php echo $lang['bases_form_save_and_close']; ?></div>
					<div class="br3 close"><?php echo $lang['bases_form_close']; ?></div>
				</div>
				<div class="title">{{title}}</div>
			</div>
			<div class="wrapper s1">
				<div class="container">
					<label class="field text">
						<div class="head"><p><?php echo $lang['bases_form_input_title']; ?></p></div>
						<div class="group">
							<input id="title" class="br3 box animate1" type="text" value="">
						</div>
					</label>
				</div>
				<div class="container uid">
					<div class="switch"></div>
					<div class="field checkbox" style="display:none;">
						<div class="group">
							<p class="br3" data="mask"><?php echo $lang['bases_form_uid_mask']; ?></p>
							<p class="br3" data="id">ID</p>
							<div class="br3 add">+</div>
							<div class="clr"></div>
						</div>
					</div>
					<div class="field text mask" style="display:none;">
						<div class="group">
							<input class="br3 box animate1" type="text" value="{{uid_mask}}" placeholder="<?php echo $lang['bases_form_uid_mask_placeholder']; ?>">
						</div>
					</div>
				</div>
				<div class="container">
					<label class="field checkbox">
						<div class="head"><p><?php echo $lang['bases_form_input_fields']; ?> <span title="<?php echo $lang['bases_form_input_fields_desc']; ?>">( ? )</span></p></div>
						<div class="group fields">
							{{fields}}
							<div class="clr"></div>
						</div>
					</label>
				</div>
				<div class="container">
					<label class="field checkbox">
						<div class="head"><p><?php echo $lang['bases_form_input_table']; ?> <span title="<?php echo $lang['bases_form_input_table_desc']; ?>">( ? )</span></p></div>
						<div class="group table">
							<p class="br3" data="id">ID</p>
							<p class="br3" data="uid">UID</p>
							<p class="br3" data="title"><?php echo $lang['bases_i_list_table_title']; ?></p>
							<p class="br3" data="date_added"><?php echo $lang['bases_i_list_table_date_added']; ?></p>
							<div class="clr"></div>
						</div>
					</label>
				</div>
			</div>
		</div>
		<div class="s2">
			<div class="header s2">
				<div class="actions">
					<div class="br3 menu">
						<div class="icon"><p class="p1 br3"></p><p class="p2 br3"></p><p class="p3 br3"></p></div>
						<div class="popup animate1"><div class="marker"></div><div class="wrapper br3">
							<div class="language">{{language}}</div>
						</div></div>
					</div>
					<div class="br3 save"><?php echo $lang['bases_form_save']; ?></div>
					<div class="br3 save_close"><?php echo $lang['bases_form_save_and_close']; ?></div>
					<div class="br3 close"><?php echo $lang['bases_form_close']; ?></div>
				</div>
				<div class="title">{{title}}</div>
			</div>
			<div class="wrapper s2">
				<div class="container">
					<label class="field box left text">
						<div class="head"><p><?php echo $lang['bases_i_form_input_title']; ?></p></div>
						<div class="group">
							<input id="private_title" class="br3 box animate1" type="text" value="">
						</div>
					</label>
					<label class="field box right text">
						<div class="head"><p><?php echo $lang['bases_i_form_input_public_title']; ?></p></div>
						<div class="group">
							<input id="public_title" class="br3 box animate1" type="text" value="">
						</div>
					</label>
					<div class="clr"></div>
				</div>
				<div class="container uid" style="display:none;">
					<label class="field text">
						<div class="head"><p>UID</p></div>
						<div class="group">
							<input id="uid" class="br3 box animate1" type="text" value="{{uid}}">
						</div>
					</label>
				</div>
			</div>
		</div>
	</div>
</div>