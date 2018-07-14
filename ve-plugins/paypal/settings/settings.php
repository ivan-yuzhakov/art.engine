<div id="plugin_paypal_settings">
	<div class="container">
		<label class="field box left text">
			<div class="head"><p><?php echo $lang['client_id']; ?></p></div>
			<div class="group">
				<input id="client_id" class="br3 box" type="text" value="{{client_id}}">
			</div>
		</label>
		<label class="field box right text">
			<div class="head"><p><?php echo $lang['client_id_sandbox']; ?></p></div>
			<div class="group">
				<input id="client_id_sandbox" class="br3 box" type="text" value="{{client_id_sandbox}}">
			</div>
		</label>
		<div class="clr"></div>
	</div>
	<div class="container">
		<label class="field box left text">
			<div class="head"><p><?php echo $lang['client_secret']; ?></p></div>
			<div class="group">
				<input id="client_secret" class="br3 box" type="text" value="{{client_secret}}">
			</div>
		</label>
		<label class="field box right text">
			<div class="head"><p><?php echo $lang['client_secret_sandbox']; ?></p></div>
			<div class="group">
				<input id="client_secret_sandbox" class="br3 box" type="text" value="{{client_secret_sandbox}}">
			</div>
		</label>
		<div class="clr"></div>
	</div>
	<div class="switch">{{test_mode}}</div>
</div>
