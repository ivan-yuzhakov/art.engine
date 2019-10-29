<div id="support">
	<div class="sections">
		<div class="section box status">
			<div class="wrapper box">
				<div class="title"><?php echo $lang['support_status_title']; ?></div>
				<div class="content"></div>
			</div>
			<div class="overlay loader animate2"></div>
		</div>
		<div class="section box help">
			<div class="wrapper box">
				<div class="title"><div class="add br3"><?php echo $lang['support_help_add']; ?></div><?php echo $lang['support_help_title']; ?></div>
				<div class="content"></div>
			</div>
			<div class="overlay loader animate2"></div>
		</div>
		<div class="section box faq">
			<div class="wrapper box">
				<div class="title"><?php echo $lang['support_faq_title']; ?></div>
				<div class="content"></div>
			</div>
			<div class="overlay loader animate2"></div>
		</div>
	</div>

	<div class="modal">
		<div class="overlay loader animate2"></div>
		<div class="popup br3 box animate2" style="{{popup_style}}">
			<div class="header">
				<div class="title">{{title}}</div>
				<div class="actions">{{actions}}</div>
			</div>
			<div class="wrapper box">{{content}}</div>
			{{bottom}}
		</div>
	</div>
</div>