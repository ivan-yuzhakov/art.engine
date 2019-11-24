<div id="users">
	<div class="list animate">
		<div class="items animate2 box" parent="a_groups">
			<div class="header">
				<?php if ($visitor->id === 1) echo '<div class="br3 animate create">' . $lang['users_create_group'] . '</div>'; ?>
				<div class="title"><?php echo $lang['users_a_groups']; ?></div>
			</div>
			<div class="scroll">
				<div class="viewport"><div class="overview">
					<div class="g br3 animate {{n}}" data="{{id}}" title="ID {{id}}">
						<p class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></p>
						<p class="title">{{title}}</p>
					</div>
				</div></div>
				<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>
			</div>
		</div>
		<div class="items animate2 box" parent="a_users">
			<div class="header">
				<?php if ($visitor->id === 1) echo '<div class="br3 animate create">' . $lang['users_create_user'] . '</div>'; ?>
				<div class="title"><?php echo $lang['users_a_users']; ?></div>
			</div>
			<div class="scroll">
				<div class="viewport"><div class="overview">
					<div class="i br3 animate {{ne}} {{nd}} {{logged}}" data="{{id}}" title="ID {{id}}">
						<p class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></p>
						<p class="title">{{title}}</p>
					</div>
				</div></div>
				<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>
			</div>
		</div>
		<div class="items animate2 box" parent="s_groups">
			<div class="header">
				<?php if ($visitor->id === 1) echo '<div class="br3 animate create">' . $lang['users_create_group'] . '</div>'; ?>
				<div class="title"><?php echo $lang['users_s_groups']; ?></div>
			</div>
			<div class="scroll">
				<div class="viewport"><div class="overview">
					<div class="g br3 animate {{n}}" data="{{id}}" title="ID {{id}}">
						<p class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></p>
						<p class="title">{{title}}</p>
					</div>
				</div></div>
				<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>
			</div>
		</div>
		<div class="items animate2 box" parent="s_users">
			<div class="header">
				<?php if ($visitor->id === 1) echo '<div class="br3 animate create">' . $lang['users_create_user'] . '</div>'; ?>
				<div class="title"><?php echo $lang['users_s_users']; ?></div>
			</div>
			<div class="scroll">
				<div class="viewport"><div class="overview">
					<div class="i br3 animate {{ne}} {{nd}} {{logged}}" data="{{id}}" title="ID {{id}}">
						<p class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></p>
						<p class="title">{{title}}</p>
					</div>
				</div></div>
				<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>
			</div>
		</div>
	</div>

	<div class="overlay animate"></div>

	<div class="form box animate">
		<div class="header">
			<div class="actions">
				<div class="br3 save"><?php echo $lang['global_save']; ?></div>
				<div class="br3 saveclose"><?php echo $lang['global_save_and_close']; ?></div>
				<div class="br3 close"><?php echo $lang['global_close']; ?></div>
			</div>
			<div class="title">{{title}}</div>
		</div>
		<div class="wrapper">
			<div class="container system">
				<div class="field box left text">
					<div class="head"><p><?php echo $lang['users_input_login']; ?><r>*</r></p></div>
					<div class="group">
						<input id="lostbsrg" class="br3 box animate1" type="text" value="">
					</div>
				</div>
				<div class="field box right text">
					<div class="head"><p><?php echo $lang['users_input_password']; ?><r>*</r></p></div>
					<div class="group">
						<input id="pauwtert" class="br3 box animate1" type="password" value="">
					</div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field box left text">
					<div class="head"><p><?php echo $lang['users_input_fname']; ?><r>*</r></p></div>
					<div class="group">
						<input id="fname" class="br3 box animate1" type="text" value="">
					</div>
				</div>
				<div class="field box right text">
					<div class="head"><p><?php echo $lang['users_input_lname']; ?></p></div>
					<div class="group">
						<input id="lname" class="br3 box animate1" type="text" value="">
					</div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field box left text">
					<div class="head"><p><?php echo $lang['users_input_email']; ?></p></div>
					<div class="group">
						<input id="email" class="br3 box animate1" type="text" value="">
					</div>
				</div>
				<div class="field box right text">
					<div class="head"><p><?php echo $lang['users_input_phone']; ?></p></div>
					<div class="group">
						<input id="phone" class="br3 box animate1" type="text" value="">
					</div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field box left text">
					<div class="head"><p><?php echo $lang['users_input_address_1']; ?></p></div>
					<div class="group">
						<input id="address_1" class="br3 box animate1" type="text" value="">
					</div>
				</div>
				<div class="field box right text">
					<div class="head"><p><?php echo $lang['users_input_address_2']; ?></p></div>
					<div class="group">
						<input id="address_2" class="br3 box animate1" type="text" value="">
					</div>
				</div>
				<div class="clr"></div>
			</div>
			<div class="container system">
				<div class="field tinymce">
					<div class="head"><p><?php echo $lang['users_input_desc']; ?></p></div>
					<div class="group"></div>
				</div>
			</div>
			<div class="container system">
				<div class="field file">
					<div class="head"><p><?php echo $lang['users_input_image']; ?></p></div>
					<div class="group"></div>
				</div>
			</div>
			<div class="container system">
				<div class="field text">
					<div class="head"><p><?php echo $lang['users_input_company']; ?></p></div>
					<div class="group">
						<input id="company" class="br3 box animate1" type="text" value="">
					</div>
				</div>
			</div>
			<div class="container system">
				<div class="field checkbox">
					<div class="head"><p><?php echo $lang['users_input_groups']; ?></p></div>
					<div class="group">{{groups}}<div class="clr"></div></div>
				</div>
			</div>
		</div>
	</div>
</div>