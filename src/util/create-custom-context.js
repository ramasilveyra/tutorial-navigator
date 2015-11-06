import Flux from 'flux'
import TutorialStore from '../stores/tutorial-store';
import ArticleStore from '../stores/article-store';
import articleService from '../services/article-service';

export default function createCustomContext(customService){
  var dispatcher = new Flux.Dispatcher();
  var stores = [];
  stores[TutorialStore.name] = new TutorialStore(dispatcher);
  stores[ArticleStore.name] = new ArticleStore(dispatcher);

  var registerStore = function registerStores(payload){
    var list = [TutorialStore, ArticleStore];
    for (var i = 0; i < list.length; i++) {
      var store = list[i];
      for (var handler in store.handlers) {
        if (handler === payload.event){
          stores[store.name][store.handlers[handler]](payload);
        }
      }
    }
  }

  dispatcher.register(registerStore);

  var context = {
    _dispatcher: dispatcher,
    dispatch: function(type, payload){
      payload['event'] = type;
      this._dispatcher.dispatch(payload);
    },

    getStore: function(Store){
      return stores[Store.name];
    },

    executeAction: function(action, payload, done){
      if (!done){
        done = function(){};
      }
      return action(context, payload, done);
    },

    getService : function(serviceName){
      if (customService){
        return {
          loadArticle : customService
        }
      }

      return articleService;
    }
  };

  return context;
}
