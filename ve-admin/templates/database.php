<div id="database">
	<div class="list box animate2">
		<div class="header">
			<div class="filter">
				<input class="br3 box animate1" type="text" placeholder="<?php echo $lang['database_list_header_filter']; ?>">
				<div class="count"></div>
				<div class="clear">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg>
				</div>
			</div>
			<div class="sorting">
				<div class="title br3" data="Sorting: ">Sorting: ID</div>
				<div class="arrow">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 451.8 257.6"><path d="M225.9 257.6c-8.1 0-16.2-3.1-22.4-9.3L9.3 54C-3.1 41.7-3.1 21.6 9.3 9.3 21.6-3.1 41.7-3.1 54 9.3l171.9 171.9L397.8 9.3c12.4-12.4 32.4-12.4 44.7 0 12.4 12.4 12.4 32.4 0 44.7L248.3 248.3c-6.2 6.2-14.3 9.3-22.4 9.3z"></path></svg>
				</div>
				<div class="popup animate1">
					<p class="br3 {{active}} {{asc}}" data="{{data}}">{{title}}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 451.8 257.6"><path d="M225.9 257.6c-8.1 0-16.2-3.1-22.4-9.3L9.3 54C-3.1 41.7-3.1 21.6 9.3 9.3 21.6-3.1 41.7-3.1 54 9.3l171.9 171.9L397.8 9.3c12.4-12.4 32.4-12.4 44.7 0 12.4 12.4 12.4 32.4 0 44.7L248.3 248.3c-6.2 6.2-14.3 9.3-22.4 9.3z"></path></svg></p>
				</div>
			</div>
			<div class="actions">
				<div class="br3 animate1 create create_item"><?php echo $lang['database_list_header_create_item']; ?></div>
				<div class="br3 animate1 create pdf"><?php echo $lang['database_list_header_pdf']; ?></div>
				<div class="br3 menu">
					<div class="icon"><p class="p1 br3"></p><p class="p2 br3"></p><p class="p3 br3"></p></div>
					<div class="popup animate1"><div class="marker"></div><div class="wrapper br3">
						<p class="br3" data="settings"><?php echo $lang['database_settings_title']; ?></p>
					</div></div>
				</div>
			</div>
		</div>
		<div class="items"></div>
	</div>

	<div class="overlay loader animate2"></div>

	<div class="form box animate2">
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
					</div></div>
				</div>
				<div class="br3 save {{s}}"><?php echo $lang['database_form_save']; ?></div>
				<div class="br3 save_close {{sc}}"><?php echo $lang['database_form_save_and_close']; ?></div>
				<div class="br3 close {{c}}"><?php echo $lang['database_form_close']; ?></div>
				<div class="br3 vd {{vd}}"><?php echo $lang['database_form_view_draft']; ?></div>
			</div>
			<div class="title">{{title}}</div>
		</div>
		<div class="wrapper"><div class="w">
			<div class="container system">
				<label class="field box left text">
					<div class="head"><p><?php echo $lang['database_form_input_title']; ?></p></div>
					<div class="group">
						<input id="private_title" class="br3 box animate1" type="text" value="">
					</div>
				</label>
				<label class="field box right text">
					<div class="head"><p><?php echo $lang['database_form_input_public_title']; ?></p></div>
					<div class="group">
						<input id="public_title" class="br3 box animate1" type="text" value="">
					</div>
				</label>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field box left select">
					<div class="head"><p><?php echo $lang['database_form_type_title']; ?></p></div>
					<div class="group">
						<p class="br3 animate1" data="1"><?php echo $lang['database_form_type_physical']; ?></p>
						<p class="br3 animate1" data="2"><?php echo $lang['database_form_type_digital']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<label class="field box right text">
					<div class="head"><p>UID</p></div>
					<div class="group">
						<input id="uid" class="br3 box animate1" type="text" value="{{uid}}" {{uid_disabled}}>
					</div>
				</label>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field file">
					<div class="head"><p><?php echo $lang['database_form_input_image']; ?></p></div>
					<div class="group"></div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="editions {{editions}}">
				<div class="head">
					<div class="br3 create"><?php echo $lang['database_edition_create']; ?></div>
					<div class="title"><?php echo $lang['database_edition_title']; ?></div>
				</div>
				<div class="items"><div class="loader"></div></div>
			</div>
			<div class="lock {{lock}}"></div>
		</div></div>
	</div>

	<div class="edition_form box animate2">
		<div class="header">
			<div class="actions">
				<div class="br3 save"><?php echo $lang['database_form_save']; ?></div>
				<div class="br3 close"><?php echo $lang['database_form_close']; ?></div>
			</div>
			<div class="title"><?php echo $lang['database_edition_f_htitle']; ?></div>
		</div>
		<div class="wrapper"><div class="w">
			<div class="container system">
				<label class="field box left text">
					<div class="head"><p><?php echo $lang['database_edition_f_title']; ?></p></div>
					<div class="group">
						<input id="title" class="br3 box animate1" type="text" value="<?php echo $lang['database_edition_f_title_def']; ?>">
					</div>
				</label>
				<label class="field box right text">
					<div class="head"><p><?php echo $lang['database_edition_f_count']; ?></p></div>
					<div class="group">
						<input id="count" class="br3 box animate1" type="text" value="">
					</div>
				</label>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field box left select status {{p}}">
					<div class="head"><p><?php echo $lang['database_edition_f_status']; ?></p></div>
					<div class="group">
						<p class="br3 animate1 active" data="1"><?php echo $lang['database_edition_f_p_np']; ?></p>
						<p class="br3 animate1" data="6"><?php echo $lang['database_edition_f_p_ol']; ?></p>
						<p class="br3 animate1" data="2"><?php echo $lang['database_edition_f_p_st']; ?></p>
						<p class="br3 animate1" data="3"><?php echo $lang['database_edition_f_p_re']; ?></p>
						<p class="br3 animate1" data="4"><?php echo $lang['database_edition_f_p_so']; ?></p>
						<p class="br3 animate1" data="5"><?php echo $lang['database_edition_f_p_gi']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="field box left select status {{d}}">
					<div class="head"><p><?php echo $lang['database_edition_f_status']; ?></p></div>
					<div class="group">
						<p class="br3 animate1 active" data="5"><?php echo $lang['database_edition_f_d_ol']; ?></p>
						<p class="br3 animate1" data="1"><?php echo $lang['database_edition_f_d_us']; ?></p>
						<p class="br3 animate1" data="2"><?php echo $lang['database_edition_f_d_re']; ?></p>
						<p class="br3 animate1" data="3"><?php echo $lang['database_edition_f_d_so']; ?></p>
						<p class="br3 animate1" data="4"><?php echo $lang['database_edition_f_d_gi']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="field box right select password {{password}}">
					<div class="head"><p><?php echo $lang['database_edition_f_password']; ?></p></div>
					<div class="group">
						<p class="br3 animate1" data="1"><?php echo $lang['database_edition_f_password_y']; ?></p>
						<p class="br3 animate1 active" data="0"><?php echo $lang['database_edition_f_password_n']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="clr"></div>
			</div>
		</div></div>
	</div>

	<div class="settings box animate2">
		<div class="header">
			<div class="actions">
				<div class="br3 save"><?php echo $lang['database_form_save']; ?></div>
				<div class="br3 save_close"><?php echo $lang['database_form_save_and_close']; ?></div>
				<div class="br3 close"><?php echo $lang['database_form_close']; ?></div>
			</div>
			<div class="title"><?php echo $lang['database_settings_title']; ?></div>
		</div>
		<div class="wrapper">
			<div class="container pdf">
				<div class="field text">
					<div class="head"><p><?php echo $lang['database_settings_pdf_templates']; ?></p></div>
					<div class="group">
						<div class="add"><?php echo $lang['database_settings_pdf_add_template']; ?></div>
					</div>
				</div>
			</div>
			<div class="container view">
				<div class="field select">
					<div class="head"><p><?php echo $lang['database_settings_view_title']; ?> <span title="<?php echo $lang['database_settings_view_desc']; ?>">( ? )</span></p></div>
					<div class="group">
						<p class="br3" data="table"><?php echo $lang['database_settings_view_table']; ?></p>
						<p class="br3" data="grid"><?php echo $lang['database_settings_view_grid']; ?></p>
						<p class="br3" data="list" style="display:none;"><?php echo $lang['database_settings_view_list']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
			</div>
			<div class="container type">
				<div class="field select">
					<div class="head"><p><?php echo $lang['database_settings_type_title']; ?></p></div>
					<div class="group">
						<p class="br3" data="1"><?php echo $lang['database_settings_type_physical']; ?></p>
						<p class="br3" data="2"><?php echo $lang['database_settings_type_digital']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
			</div>
			<div class="container fields">
				<div class="field box left items f">
					<div class="head"><p><?php echo $lang['database_settings_fields_title']; ?> <span title="<?php echo $lang['database_settings_fields_desc']; ?>">( ? )</span></p></div>
					<div class="group">
						<div class="left box"><div class="ui-combobox"></div></div><div class="right box"><div class="elems"></div></div><div class="clr"></div><div class="loading br3"></div>
					</div>
				</div>
				<div class="field box right items d">
					<div class="head"><p><?php echo $lang['database_settings_display_title']; ?> <span title="<?php echo $lang['database_settings_display_desc']; ?>">( ? )</span></p></div>
					<div class="group"></div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="container uid">
				<div class="field items">
					<div class="head"><p><?php echo $lang['database_settings_uid_title']; ?></p></div>
					<div class="group">
						<div class="switch"></div>
						<div class="inner">
							<div class="left box">
								<input id="mask" class="br3 box animate1" type="text" value="" placeholder="<?php echo $lang['database_settings_uid_mask_ph']; ?>">
								<input id="separate" class="br3 box animate1" type="text" value="" placeholder="<?php echo $lang['database_settings_uid_sep_ph']; ?>">
								<div class="ui-combobox">
							</div>
							</div><div class="right box"><div class="elems"></div></div><div class="clr"></div><div class="loading br3"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>