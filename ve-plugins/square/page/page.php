<div id="plugin_square_page" class="content">
	<div class="list box">
		<div class="header">
			{{locations}}
			<div class="title">Square UI</div>
		</div>
		<div class="wrapper">
			<div class="sections">
				<p data="payments">Payments</p>
				<p data="customers">Customers</p>
				<p data="items">Items</p>
				<p data="orders">Orders</p>
			</div>
			<div class="section payments">
				<div class="payment br3" data="{{id}}">
					<div class="money">
						<div class="amount">{{amount}}</div>
						<div class="currency">{{currency}}</div>
					</div>
					<div class="date">Date: {{date}}</div>
					<div class="type">Type: {{type}}</div>
					<div class="card">Card: {{card}}, *{{last_4}}</div>
				</div>
			</div>
			<div class="section customers">
				<div class="customer br3" data="{{id}}">
					<div class="name">Name: {{name}} {{family_name}}</div>
					<div class="email">E-mail: {{email}}</div>
					<div class="phone">Phone: {{phone}}</div>
					<div class="note">Note: {{note}}</div>
					<div class="address">Address: {{country}}, {{locality}}, {{address_line}}</div>
					<div class="date">Date: {{date}}</div>
					<div class="groups">Groups: {{groups}}</div>
				</div>
			</div>
			<div class="section items">
				<div class="item br3" data="{{id}}">
					<div class="name">Name: {{name}}</div>
					<div class="type">Type: {{type}}</div>
					<div class="visibility">Visibility: {{visibility}}</div>
					<div class="available_for_pickup">Available for pickup: {{available_for_pickup}}</div>
					<div class="available_online">Available online: {{available_online}}</div>
				</div>
			</div>
			<div class="section orders">
				<div class="order br3" data="{{id}}">
					<div class="date">Date: {{date}}</div>
				</div>
			</div>
		</div>
	</div>
</div>