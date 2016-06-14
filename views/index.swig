{% extends 'base.swig' %}

{% set title = 'Login' %}
{% set heading = title %}

{% block content %}
	<form method="post" style="max-width: 300px;">
		<p>
			<label for="password">Password: </label>
			<input id="password" name="password" type="password" class="form-control" />
		</p>
		<p>
			<button class="btn btn-primary" role="button">Login</button>
		</p>
	</form>
{% endblock %}
