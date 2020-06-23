<div id="plugin_stripe_settings">
	<div class="container">
		<label class="field box left text">
			<div class="head"><p><?php echo $lang['public_key']; ?></p></div>
			<div class="group">
				<input id="public_key" class="br3 box" type="text" value="{{public_key}}">
			</div>
		</label>
		<label class="field box right text">
			<div class="head"><p><?php echo $lang['sandbox_public_key']; ?></p></div>
			<div class="group">
				<input id="sandbox_public_key" class="br3 box" type="text" value="{{sandbox_public_key}}">
			</div>
		</label>
		<div class="clr"></div>
	</div>
	<div class="container">
		<label class="field box left text">
			<div class="head"><p><?php echo $lang['private_key']; ?></p></div>
			<div class="group">
				<input id="private_key" class="br3 box" type="text" value="{{private_key}}">
			</div>
		</label>
		<label class="field box right text">
			<div class="head"><p><?php echo $lang['sandbox_private_key']; ?></p></div>
			<div class="group">
				<input id="sandbox_private_key" class="br3 box" type="text" value="{{sandbox_private_key}}">
			</div>
		</label>
		<div class="clr"></div>
	</div>
	<div class="switch">{{test_mode}}</div>
</div>
