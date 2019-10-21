const chalk = require('chalk'); 
const ValidationHelper = require('./validation.helper'); 


module.exports = {
  register(server, routes) {
    
    const sortedRoutes = routes.sort((a, b) => a.path.localeCompare(b.path));

    for (let route of sortedRoutes) {
      const definition = ValidationHelper.getRouteValidation(route.path, route.method);


      if (!definition) {
        console.warn(chalk.yellow(`WARNING: Route has no definition '${route.path}'.` ))
        console.log(chalk.yellow(route.path)+' '+chalk.blue(route.method));
        server.route(route);
      } 
      else {

      // TODO: test for equality

      console.log(chalk.green(route.path)+' '+chalk.blue(route.method) + ' '+ definition.name);
      server.route({...definition, handler: route.handler});
      }
    }
  }
}
