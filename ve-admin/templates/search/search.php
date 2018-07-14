<div id="search" class="box animate2"><div class="wrapper">
	<div class="search">
		<input class="br3 box" type="text" value="" placeholder="<?php echo $lang['search_input_placeholder']; ?>">
	</div>
	<div class="result box">
		<div class="items">
			<div class="head"><?php echo $lang['search_items']; ?></div>
			<div class="scroll">
				<div class="viewport"><div class="overview animate1">
					<div class="item" data="{{id}}">
						<div class="image br3" style="background-image:url({{image}});" title="ID {{id}}"></div>
						<div class="info br3">
							<div class="title" title="{{title}}">{{title}}</div>
							<div class="path">{{path}}</div>
						</div>
					</div>
				</div></div>
				<div class="scrollbar animate1"><div class="track"><div class="thumb br3 animate1"></div></div></div>
			</div>
		</div>
		<div class="files">
			<div class="head"><?php echo $lang['search_files']; ?></div>
			<div class="scroll">
				<div class="viewport"><div class="overview animate1">
					<div class="item" data="{{id}}">
						<div class="image br3" style="background-image:url({{image}});" title="ID {{id}}"></div>
						<div class="info br3">
							<div class="title" title="{{title}}">{{title}}</div>
							<div class="path">{{path}}</div>
						</div>
					</div>
				</div></div>
				<div class="scrollbar animate1"><div class="track"><div class="thumb br3 animate1"></div></div></div>
			</div>
		</div>
	</div>
</div></div>