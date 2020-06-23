<div id="items">
	<div class="list animate2">
		<div class="items animate2 box" parent="{{parent}}" style="width:{{width}}px;">
			<div class="header">
				<div class="actions">
					<div class="br3 create animate1"><?php echo $lang['items_header_create_item']; ?></div>
					<div class="br3 menu">
						<div class="icon"><p class="p1 br3"></p><p class="p2 br3"></p><p class="p3 br3"></p></div>
						<div class="popup animate1"><div class="marker"></div><div class="wrapper br3">
							<p class="br3" data="select_all"><?php echo $lang['items_header_select_all']; ?></p>
							<p class="br3" data="unselect_all"><?php echo $lang['items_header_unselect_all']; ?></p>
							<p class="br3" data="enable_selected"><?php echo $lang['items_header_enable_selected']; ?></p>
							<p class="br3" data="disable_selected"><?php echo $lang['items_header_disable_selected']; ?></p>
							<p class="br3 clone" data="clone_selected"><?php echo $lang['items_header_clone_selected']; ?></p>
							<p class="br3 remove" data="remove_selected"><?php echo $lang['items_header_remove_selected']; ?></p>
						</div></div>
					</div>
				</div>
				<div class="title">{{title}}</div>
			</div>
			<div class="scroll">
				<div class="viewport"><div class="overview">
					<div id="i{{id}}" class="item br3 {{class}}" data="{{id}}">
						<p class="select"><b><i class="animate1"></i></b></p>
						<p class="edit"><?php echo $icons['edit']; ?></p>
						<p class="info" title="ID {{id}}">
							<span class="count">{{count}}</span>
							<span class="title">{{title}}</span>
						</p>
					</div>
				</div></div>
				<div class="scrollbar animate1"><div class="track"><div class="thumb br3"></div></div></div>
			</div>
		</div>
	</div>

	<div class="overlay loader animate"></div>

	<div class="form box animate">
		<div class="header">
			<div class="actions">
				<div class="br3 menu">
					<div class="icon"><p class="p1 br3"></p><p class="p2 br3"></p><p class="p3 br3"></p></div>
					<div class="popup animate1"><div class="marker"></div><div class="wrapper br3">
						<div class="language">{{language}}</div>
						<div class="drafts_control {{dc}}">
							<p class="br3 animate1 vo {{vo}}"><?php echo $lang['database_form_view_original']; ?></p>
							<p class="br3 animate1 rd {{rd}}"><?php echo $lang['database_form_remove_draft']; ?></p>
						</div>
						<div class="ext">
							<p class="br3 animate1"><?php echo $lang['items_form_extra']; ?></p>
						</div>
						<div class="groups {{gr}}">
							{{groups}}
							<p class="br3 animate1 clear" data="0"><?php echo $lang['items_form_clear_fields']; ?></p>
						</div>
					</div></div>
				</div>
				<div class="br3 publish {{pub}}"><?php echo $icons['publish']; ?><p class="views" title="<?php echo $lang['items_form_count_views']; ?>"></p></div>
				<div class="br3 save {{s}}"><?php echo $lang['items_form_save']; ?></div>
				<div class="br3 save_close {{sc}}"><?php echo $lang['items_form_save_and_close']; ?></div>
				<div class="br3 close {{c}}"><?php echo $lang['items_form_close']; ?></div>
				<div class="br3 vd {{vd}}"><?php echo $lang['items_form_view_draft']; ?></div>
			</div>
			<div class="title">{{title}}</div>
		</div>
		<div class="wrapper"><div class="w">
			<div class="main">
				<div class="container system">
					<label class="field box left text">
						<div class="head"><p><?php echo $lang['items_form_input_private_title']; ?></p></div>
						<div class="group">
							<input id="private_title" class="br3 box animate1" type="text" value="">
						</div>
					</label>
					<label class="field box right text">
						<div class="head"><p><?php echo $lang['items_form_input_public_title']; ?></p></div>
						<div class="group">
							<input id="public_title" class="br3 box animate1" type="text" value="">
						</div>
					</label>
					<div class="clr"></div>
				</div>
				<div class="container system">
					<label class="field box left text">
						<div class="head"><p><?php echo $lang['items_form_input_alias']; ?></p></div>
						<div class="group">
							<input id="alias" class="br3 box animate1" type="text" value="" placeholder="<?php echo $lang['items_form_input_alias_placeholder']; ?>">
						</div>
					</label>
					<div class="field box right text">
						<div class="head"><p><?php echo $lang['items_form_input_link']; ?></p></div>
						<div class="group link">
							<input id="link" class="br3 box" type="text" value="" placeholder="<?php echo $lang['items_form_input_link_placeholder']; ?>" disabled>
							<a href="" target="_blank" class="hide"><?php echo $lang['items_form_input_link_view']; ?></a>
						</div>
					</div>
					<div class="clr"></div>
				</div>
				<div class="container system hide">
					<div class="field tinymce">
						<div class="head"><p><?php echo $lang['items_form_input_desc']; ?></p></div>
						<div class="group"></div>
					</div>
				</div>
				<div class="container system hide">
					<div class="field file">
						<div class="head"><p><?php echo $lang['items_form_input_image']; ?></p></div>
						<div class="group"></div>
					</div>
				</div>
			</div>
			<div class="extra">
				<div class="container system">
					<label class="field text">
						<div class="head"><p><?php echo $lang['items_form_input_meta_title']; ?></p></div>
						<div class="group">
							<input id="meta_title" class="br3 box animate1" type="text" value="">
						</div>
					</label>
				</div>
				<div class="container system">
					<label class="field text">
						<div class="head"><p><?php echo $lang['items_form_input_meta_desc']; ?></p></div>
						<div class="group">
							<input id="meta_desc" class="br3 box animate1" type="text" value="">
						</div>
					</label>
				</div>
				<div class="container system">
					<label class="field text">
						<div class="head"><p><?php echo $lang['items_form_input_meta_keys']; ?></p></div>
						<div class="group">
							<input id="meta_keys" class="br3 box animate1" type="text" value="">
						</div>
					</label>
				</div>
				<div class="container system">
					<div class="field checkbox">
						<div class="head"><p><?php echo $lang['items_form_input_sharing']; ?></p></div>
						<div class="group sharing">
							<p class="animate1 br3 facebook">Facebook</p>
							<div class="clr"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="lock {{lock}}"></div>
		</div></div>
		<div class="warning {{warning}}"><div class="outer">
			<div class="title"><?php echo $lang['items_form_warning_title']; ?></div>
			{{groups}}
			<p class="br3 clear" data="0"><?php echo $lang['items_form_clear_fields']; ?></p>
			<div class="br3 cancel"><?php echo $lang['global_cancel']; ?></div>
		</div></div>
	</div>
</div>