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
				<div class="br3 animate1 remove"><?php echo $lang['database_list_header_remove']; ?></div>
				<div class="br3 animate1 create pdf"><?php echo $lang['database_list_header_pdf']; ?></div>
				<div class="br3 animate1 create report"><?php echo $lang['database_list_header_report']; ?></div>
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
						<input id="db_pr_title" class="br3 box animate1" type="text" value="">
					</div>
				</label>
				<label class="field box right text">
					<div class="head"><p><?php echo $lang['database_form_input_public_title']; ?></p></div>
					<div class="group">
						<input id="db_pu_title" class="br3 box animate1" type="text" value="">
					</div>
				</label>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field box left select type">
					<div class="head"><p><?php echo $lang['database_form_type_title']; ?></p></div>
					<div class="group">
						<p class="br3 animate1" data="1"><?php echo $lang['database_form_type_physical']; ?></p>
						<p class="br3 animate1" data="2"><?php echo $lang['database_form_type_digital']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="field box right select unique">
					<div class="head"><p><?php echo $lang['database_form_unique']; ?></p></div>
					<div class="group">
						<p class="br3 animate1" data="1"><?php echo $lang['database_form_unique_y']; ?></p>
						<p class="br3 animate1" data="0"><?php echo $lang['database_form_unique_n']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field box left file">
					<div class="head"><p><?php echo $lang['database_form_input_image']; ?></p></div>
					<div class="group"></div>
				</div>
				<label class="field box right text">
					<div class="head"><p>UID</p></div>
					<div class="group">
						<input id="uid" class="br3 box animate1" type="text" value="{{uid}}" {{uid_disabled}}>
					</div>
				</label>
				<div class="clr"></div>
			</div>
			<div class="edition_settings {{edition_settings}}">
				<div class="head">
					<div class="title"><?php echo $lang['database_editionf_title']; ?></div>
				</div>
				<div class="items br3">
					<div class="col box s">{{ed_status}}</div>
					<div class="col box f">
						<div data="type" content="<?php echo $lang['database_edition_childs_type']; ?>" contenteditable="true"></div>
						<div data="seller" content="<?php echo $lang['database_edition_childs_seller']; ?>" contenteditable="true" style="display:none;"></div>
						<div data="client" content="<?php echo $lang['database_edition_childs_client']; ?>" contenteditable="true" style="display:none;"></div>
						<div data="date" content="<?php echo $lang['database_edition_childs_date']; ?>" contenteditable="true" style="display:none;"></div>
						<div data="date_start" content="<?php echo $lang['database_edition_childs_date_start']; ?>" contenteditable="true" style="display:none;"></div>
						<div data="date_end" content="<?php echo $lang['database_edition_childs_date_end']; ?>" contenteditable="true" style="display:none;"></div>
						<div data="location" content="<?php echo $lang['database_edition_childs_location']; ?>" contenteditable="true" style="display:none;"></div>
						<span class="no"><?php echo $lang['database_edition_childs_nof']; ?></span>
					</div>
					<div class="col box n" contenteditable="true" content="Note...">{{ed_note}}</div>
				</div>
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
			<div class="title">{{title}}</div>
		</div>
		<div class="wrapper"><div class="w">
			<div class="container system">
				<label class="field box left text">
					<div class="head"><p><?php echo $lang['database_edition_f_title']; ?></p></div>
					<div class="group">
						<input id="ed_title" class="br3 box animate1" type="text" value="<?php echo $lang['database_edition_f_title_def']; ?>">
					</div>
				</label>
				<label class="field box right text {{q}}">
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
						<p class="br3 animate1 active" data="1"><?php echo $lang['database_edition_f_1_1']; ?></p>
						<p class="br3 animate1" data="6"><?php echo $lang['database_edition_f_1_6']; ?></p>
						<p class="br3 animate1" data="2"><?php echo $lang['database_edition_f_1_2']; ?></p>
						<p class="br3 animate1" data="3"><?php echo $lang['database_edition_f_1_3']; ?></p>
						<p class="br3 animate1" data="4"><?php echo $lang['database_edition_f_1_4']; ?></p>
						<p class="br3 animate1" data="5"><?php echo $lang['database_edition_f_1_5']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="field box left select status {{d}}">
					<div class="head"><p><?php echo $lang['database_edition_f_status']; ?></p></div>
					<div class="group">
						<p class="br3 animate1 active" data="5"><?php echo $lang['database_edition_f_2_5']; ?></p>
						<p class="br3 animate1" data="1"><?php echo $lang['database_edition_f_2_1']; ?></p>
						<p class="br3 animate1" data="2"><?php echo $lang['database_edition_f_2_2']; ?></p>
						<p class="br3 animate1" data="3"><?php echo $lang['database_edition_f_2_3']; ?></p>
						<p class="br3 animate1" data="4"><?php echo $lang['database_edition_f_2_4']; ?></p>
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
			<div class="captions"></div>
		</div></div>
	</div>

	<div class="edition_modal box animate2 br3">
		<div class="header">
			<div class="title">{{title}}</div>
			<div class="close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>
		</div>
		<div class="wrapper box">{{editions}}</div>
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
			<div class="container">
				<div class="field box left select view">
					<div class="head"><p><?php echo $lang['database_settings_view_title']; ?> <span title="<?php echo $lang['database_settings_view_desc']; ?>">( ? )</span></p></div>
					<div class="group">
						<p class="br3" data="table"><?php echo $lang['database_settings_view_table']; ?></p>
						<p class="br3" data="grid"><?php echo $lang['database_settings_view_grid']; ?></p>
						<p class="br3" data="list" style="display:none;"><?php echo $lang['database_settings_view_list']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="field box right select type">
					<div class="head"><p><?php echo $lang['database_settings_type_title']; ?></p></div>
					<div class="group">
						<p class="br3" data="1"><?php echo $lang['database_settings_type_physical']; ?></p>
						<p class="br3" data="2"><?php echo $lang['database_settings_type_digital']; ?></p>
						<div class="clr"></div>
					</div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="container fields">
				<div class="field items s">
					<div class="head"><p><?php echo $lang['database_settings_fields_title']; ?></p></div>
					<div class="group">
						<div class="ui-combobox"></div>
					</div>
				</div>
			</div>
			<div class="container fields">
				<div class="field box left items f">
					<div class="head"><p><?php echo $lang['database_settings_sfields_title']; ?> <span title="<?php echo $lang['database_settings_sfields_desc']; ?>">( ? )</span></p></div>
					<div class="group">
						<div class="elems"></div>
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
			<div class="container style">
				<div class="field textarea">
					<div class="head"><p><?php echo $lang['database_settings_style_title']; ?></p></div>
					<div class="group">
						<textarea class="br3 box animate1" rows="20"></textarea>
					</div>
				</div>
			</div>
			<div class="container ed_type">
				<div class="field text">
					<div class="head"><p><?php echo $lang['database_settings_ed_type_title']; ?></p></div>
					<div class="group">
						<input class="br3 box animate1" type="text" value="">
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="report_modal box animate2 br3">
		<div class="header">
			<div class="title"><?php echo $lang['database_list_header_report']; ?></div>
			<div class="actions">
				<div class="print"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M329.956 399.834H182.044c-9.425 0-17.067 7.641-17.067 17.067s7.641 17.067 17.067 17.067h147.911c9.425 0 17.067-7.641 17.067-17.067s-7.641-17.067-17.066-17.067zM329.956 346.006H182.044c-9.425 0-17.067 7.641-17.067 17.067s7.641 17.067 17.067 17.067h147.911c9.425 0 17.067-7.641 17.067-17.067s-7.641-17.067-17.066-17.067z"/><path d="M472.178 133.907h-54.303V35.132c0-9.425-7.641-17.067-17.067-17.067H111.192c-9.425 0-17.067 7.641-17.067 17.067v98.775H39.822C17.864 133.907 0 151.772 0 173.73v171.702c0 21.958 17.864 39.822 39.822 39.822h54.306v91.614c0 9.425 7.641 17.067 17.067 17.067h289.61c9.425 0 17.067-7.641 17.067-17.067v-91.614h54.306c21.958 0 39.822-17.864 39.822-39.822V173.73c0-21.957-17.864-39.823-39.822-39.823zm-343.92-81.708h255.483v81.708H128.258V52.199zm255.48 407.602H128.262V320.173h255.477l-.001 139.628zm17.07-225.679h-43.443c-9.425 0-17.067-7.641-17.067-17.067s7.641-17.067 17.067-17.067h43.443c9.425 0 17.067 7.641 17.067 17.067s-7.641 17.067-17.067 17.067z"/></svg></div>
				<div class="close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>
			</div>
		</div>
		<div class="wrapper box"></div>
	</div>
</div>